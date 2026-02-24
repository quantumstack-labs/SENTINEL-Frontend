import os
import httpx
from datetime import datetime, timedelta
from app.integrations.llm_client import extract_commitments


class GitHubClient:
    def __init__(self, access_token: str):
        self.token = access_token
        self.base_url = "https://api.github.com"
        self.headers = {
            "Authorization": f"Bearer {self.token}",
            "Accept": "application/vnd.github.v3+json"
        }

    async def sync_repository_signals(self, repo_full_name: str, workspace_id: str):
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                pulls_res = await client.get(
                    f"{self.base_url}/repos/{repo_full_name}/pulls",
                    headers=self.headers,
                    params={"state": "open"}
                )
                
                if pulls_res.status_code != 200:
                    print(f"  [GitHub] ✗ Failed to fetch PRs for {repo_full_name}: HTTP {pulls_res.status_code}")
                    return

                pulls = pulls_res.json()
                for pr in pulls:
                    messages_for_llm = [
                        {
                            "author_email": pr["user"]["login"] + "@github.com",
                            "channel": repo_full_name,
                            "text": f"PR Title: {pr['title']}\nDescription: {pr.get('body') or ''}"
                        }
                    ]

                    comments_res = await client.get(pr["comments_url"], headers=self.headers)
                    if comments_res.status_code == 200:
                        for c in comments_res.json():
                            messages_for_llm.append({
                                "author_email": c["user"]["login"] + "@github.com",
                                "channel": repo_full_name,
                                "text": c.get("body") or ""
                            })

                    signals = await extract_commitments(messages_for_llm)
                    
                    from app.services import commitment_service
                    for sig in signals:
                        sig["workspace_id"] = workspace_id
                        sig["source"] = "github"
                        sig["external_ref"] = pr["html_url"]
                        commitment_service.create_commitment(workspace_id, sig)
        except Exception as exc:
            print(f"  [GitHub] ✗ sync_repository_signals failed for {repo_full_name}: {type(exc).__name__}: {exc}")