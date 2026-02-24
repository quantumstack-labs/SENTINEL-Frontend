import hmac
import hashlib
import os
from urllib.parse import urlencode

import httpx
from fastapi import APIRouter, Request, Header, HTTPException, BackgroundTasks
from fastapi.responses import RedirectResponse

from app.integrations.github_client import GitHubClient
from app.db import queries
from app.config import settings

router = APIRouter(tags=["GitHub"])

GITHUB_WEBHOOK_SECRET = os.getenv("GITHUB_WEBHOOK_SECRET", "")



def verify_signature(payload: bytes, signature: str | None) -> bool:
    if not signature or '=' not in signature:
        return False
    sha_name, _, sig_hash = signature.partition('=')
    if sha_name != 'sha256':
        return False
    if not GITHUB_WEBHOOK_SECRET:
        print("  [GitHub] WARNING: GITHUB_WEBHOOK_SECRET is empty — rejecting webhook.")
        return False
    mac = hmac.new(GITHUB_WEBHOOK_SECRET.encode(), payload, hashlib.sha256)
    return hmac.compare_digest(mac.hexdigest(), sig_hash)


@router.post("/webhook")
async def github_webhook(
    request: Request,
    background_tasks: BackgroundTasks,
    x_hub_signature_256: str = Header(None),
):
    raw_body = await request.body()

    if not verify_signature(raw_body, x_hub_signature_256):
        raise HTTPException(status_code=401, detail="Invalid signature")

    payload = await request.json()
    event = request.headers.get("X-GitHub-Event")

    if event == "pull_request" and payload.get("action") in ["opened", "edited"]:
        repo_name = payload["repository"]["full_name"]

       
        from app.db.client import get_supabase
        sb = get_supabase()
        result = (
            sb.table("integrations")
            .select("*")
            .eq("id", "github")
            .eq("status", "connected")
            .execute()
        )
        integration = result.data[0] if result.data else None

        if integration:
            client = GitHubClient(integration["access_token"])
            background_tasks.add_task(
                client.sync_repository_signals,
                repo_name,
                integration["workspace_id"],
            )

    return {"status": "ok"}



GITHUB_OAUTH_SCOPES = "repo read:user user:email"


@router.get("/oauth/authorize")
async def github_oauth_authorize(token: str = ""):
    """Step 1: Redirect admin to GitHub consent screen.
    Called via browser redirect — JWT is passed as ?token= query param.
    """
    if not settings.GITHUB_CLIENT_ID:
        raise HTTPException(status_code=500, detail="GITHUB_CLIENT_ID not configured")

    if not token:
        raise HTTPException(status_code=401, detail="Missing token query parameter")

    from app.services import auth_service
    try:
        payload = auth_service.verify_token(token)
        workspace_id = payload.get("workspace_id", "")
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")

    if not workspace_id:
        raise HTTPException(status_code=401, detail="No workspace_id in token")

    params = {
        "client_id": settings.GITHUB_CLIENT_ID,
        "redirect_uri": settings.GITHUB_REDIRECT_URI,
        "scope": GITHUB_OAUTH_SCOPES,
        "state": workspace_id,  
    }
    url = f"https://github.com/login/oauth/authorize?{urlencode(params)}"
    return RedirectResponse(url)


@router.get("/oauth/callback")
async def github_oauth_callback(code: str, state: str = ""):
    """Step 2: GitHub redirects here with a `code`. Exchange it for an access token."""
    workspace_id = state
    if not workspace_id:
        raise HTTPException(status_code=400, detail="Missing workspace_id in OAuth state")

   
    async with httpx.AsyncClient(timeout=15.0) as client:
        response = await client.post(
            "https://github.com/login/oauth/access_token",
            json={
                "client_id": settings.GITHUB_CLIENT_ID,
                "client_secret": settings.GITHUB_CLIENT_SECRET,
                "code": code,
                "redirect_uri": settings.GITHUB_REDIRECT_URI,
            },
            headers={"Accept": "application/json"},
        )

    data = response.json()
    access_token = data.get("access_token", "")

    if not access_token:
        error = data.get("error_description") or data.get("error", "unknown_error")
        print(f"[GitHub OAuth] ✗ Token exchange failed: {error}")
        raise HTTPException(status_code=400, detail=f"GitHub OAuth failed: {error}")

   
    github_username = ""
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            user_resp = await client.get(
                "https://api.github.com/user",
                headers={"Authorization": f"Bearer {access_token}", "Accept": "application/vnd.github+json"},
            )
        if user_resp.status_code == 200:
            github_username = user_resp.json().get("login", "")
    except Exception:
        pass  

    print(f"[GitHub OAuth] ✓ Token obtained for user: {github_username or 'unknown'}")

   
    queries.update_integration_status(workspace_id, "github", "connected", {
        "access_token": access_token,
        "connected_account": github_username,
    })

   
    frontend_url = settings.FRONTEND_URL.rstrip("/")
    return RedirectResponse(f"{frontend_url}/dashboard/integrations?github=connected")