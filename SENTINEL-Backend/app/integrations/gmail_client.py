"""
Gmail integration client — VULN-03 Fix.

Handles access-token refresh automatically using the stored refresh_token.
Returns messages in the same {text, author_email, channel} shape as slack_client
so the downstream LLM pipeline needs zero changes.
"""
from datetime import datetime, timezone, timedelta
import base64
import httpx


GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token"
GMAIL_API_BASE  = "https://gmail.googleapis.com/gmail/v1"


async def _refresh_access_token(client: httpx.AsyncClient, client_id: str, client_secret: str, refresh_token: str) -> str | None:
    """Exchange a refresh_token for a fresh access_token."""
    try:
        resp = await client.post(
            GOOGLE_TOKEN_URL,
            data={
                "client_id":     client_id,
                "client_secret": client_secret,
                "refresh_token": refresh_token,
                "grant_type":    "refresh_token",
            },
            timeout=10.0,
        )
        data = resp.json()
        if resp.status_code == 200 and "access_token" in data:
            print("  [Gmail] [OK] Access token refreshed.")
            return data["access_token"]
        else:
            print(f"  [Gmail] [FAIL] Token refresh failed: {data.get('error')} — {data.get('error_description')}")
            return None
    except Exception as exc:
        print(f"  [Gmail] [FAIL] Token refresh exception: {exc}")
        return None


def _extract_body(payload: dict) -> str:
    """Walk the MIME tree and extract plain-text body."""
    mime = payload.get("mimeType", "")
    if mime == "text/plain":
        data = payload.get("body", {}).get("data", "")
        if data:
            return base64.urlsafe_b64decode(data + "==").decode("utf-8", errors="replace").strip()
    for part in payload.get("parts", []):
        text = _extract_body(part)
        if text:
            return text
    return ""


async def fetch_recent_emails(
    access_token: str,
    since_hours: int = 24,
    *,
    refresh_token: str | None = None,
    client_id: str | None = None,
    client_secret: str | None = None,
) -> list[dict]:
    """
    Fetch up to 50 recent emails from Gmail.

    If access_token is expired (401), automatically refreshes it using
    refresh_token + client_id + client_secret (all optional; pass them
    from the stored integration row).

    Returns a list of dicts: {text, author_email, channel}
    """
    if not access_token:
        print("  [Gmail] No access token — skipping Gmail fetch.")
        return []

    cutoff_epoch_ms = int(
        (datetime.now(timezone.utc) - timedelta(hours=since_hours)).timestamp()
    )

    async with httpx.AsyncClient() as client:
        token = access_token

        async def _get(path: str, params: dict | None = None) -> dict | None:
            nonlocal token
            for attempt in range(2):
                headers = {"Authorization": f"Bearer {token}"}
                resp = await client.get(f"{GMAIL_API_BASE}{path}", headers=headers, params=params, timeout=15.0)
                if resp.status_code == 401 and attempt == 0:
                    # Token expired — try to refresh once
                    if refresh_token and client_id and client_secret:
                        print("  [Gmail] 401 received — attempting token refresh...")
                        new_token = await _refresh_access_token(client, client_id, client_secret, refresh_token)
                        if new_token:
                            token = new_token
                            continue  # retry with new token
                    print("  [Gmail] [FAIL] 401 and no refresh credentials — skipping Gmail.")
                    return None
                if resp.status_code != 200:
                    print(f"  [Gmail] [FAIL] {path} returned {resp.status_code}")
                    return None
                return resp.json()
            return None

        # 1. List message IDs matching the time window
        list_data = await _get(
            "/users/me/messages",
            params={"maxResults": 50, "q": f"after:{cutoff_epoch_ms // 1000}"},
        )
        if not list_data:
            return []

        message_ids = [m["id"] for m in list_data.get("messages", [])]
        if not message_ids:
            print(f"  [Gmail] No new emails in the last {since_hours}h.")
            return []

        print(f"  [Gmail] Fetching {len(message_ids)} email(s)...")

        messages: list[dict] = []
        for msg_id in message_ids:
            msg_data = await _get(f"/users/me/messages/{msg_id}", params={"format": "full"})
            if not msg_data:
                continue

            headers = {h["name"].lower(): h["value"] for h in msg_data.get("payload", {}).get("headers", [])}
            subject  = headers.get("subject", "(no subject)")
            sender   = headers.get("from", "")
            # Extract bare email from "Name <email>" format
            author_email = sender.split("<")[-1].rstrip(">").strip() if "<" in sender else sender.strip()

            body = _extract_body(msg_data.get("payload", {}))
            if not body:
                continue  # skip empty/HTML-only emails

            messages.append({
                "text":         f"Subject: {subject}\n\n{body[:2000]}",  # cap at 2000 chars
                "author_email": author_email,
                "channel":      "gmail",
            })

        print(f"  [Gmail] Done. {len(messages)} email(s) with text body collected.")
        return messages
