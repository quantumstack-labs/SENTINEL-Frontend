from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import RedirectResponse
from pydantic import BaseModel
from urllib.parse import urlencode
import httpx

from app.api.deps import get_workspace_id
from app.models.schemas import InviteMemberIn
from app.models.envelopes import ok
from app.services import integration_service
from app.config import settings
from app.db import queries


router = APIRouter(prefix="/integrations", tags=["Integrations"])


# ── Existing CRUD ────────────────────────────────────────────────

@router.get("")
async def list_integrations(workspace_id: str = Depends(get_workspace_id)):
    integrations = integration_service.get_integrations(workspace_id)
    return ok([i.model_dump(by_alias=True) for i in integrations])


@router.post("/{integration_id}/connect")
async def connect_integration(
    integration_id: str,
    credentials: dict = {},
    workspace_id: str = Depends(get_workspace_id),
):
    result = integration_service.connect_integration(integration_id, workspace_id, credentials)
    return ok(result.model_dump(by_alias=True))


@router.delete("/{integration_id}/disconnect")
async def disconnect_integration(integration_id: str, workspace_id: str = Depends(get_workspace_id)):
    result = integration_service.disconnect_integration(integration_id, workspace_id)
    return ok(result)


# ── Slack OAuth Flow ─────────────────────────────────────────────

SLACK_OAUTH_SCOPES = ",".join([
    "channels:read",
    "channels:history",
    "groups:read",
    "groups:history",
    "users:read",
    "users:read.email",
])


@router.get("/slack/oauth/authorize")
async def slack_oauth_authorize(token: str = ""):
    """Step 1: Redirect admin to Slack consent screen.
    Called via browser redirect, so we accept the JWT as a query param
    (browsers can't set Authorization headers on a redirect).
    """
    if not settings.SLACK_CLIENT_ID:
        raise HTTPException(status_code=500, detail="SLACK_CLIENT_ID not configured")

    # Extract workspace_id from the JWT query param
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
        "client_id": settings.SLACK_CLIENT_ID,
        "scope": SLACK_OAUTH_SCOPES,
        "redirect_uri": settings.SLACK_REDIRECT_URI,
        "state": workspace_id,  # pass workspace_id through OAuth state
    }
    url = f"https://slack.com/oauth/v2/authorize?{urlencode(params)}"
    return RedirectResponse(url, status_code=302)


@router.get("/slack/oauth/callback")
async def slack_oauth_callback(code: str, state: str = ""):
    """Step 2: Slack redirects here with a `code`. Exchange it for a token."""
    workspace_id = state
    if not workspace_id:
        raise HTTPException(status_code=400, detail="Missing workspace_id in OAuth state")

    # Exchange the code for a bot token
    async with httpx.AsyncClient(timeout=15.0) as client:
        response = await client.post(
            "https://slack.com/api/oauth.v2.access",
            data={
                "client_id": settings.SLACK_CLIENT_ID,
                "client_secret": settings.SLACK_CLIENT_SECRET,
                "code": code,
                "redirect_uri": settings.SLACK_REDIRECT_URI,
            },
        )

    data = response.json()
    if not data.get("ok"):
        error = data.get("error", "unknown_error")
        print(f"[Slack OAuth] [FAIL] Token exchange failed: {error}")
        raise HTTPException(status_code=400, detail=f"Slack OAuth failed: {error}")

    bot_token = data.get("access_token", "")
    team_name = data.get("team", {}).get("name", "Slack Workspace")
    print(f"[Slack OAuth] [OK] Token obtained for workspace: {team_name}")

    # Save the token and mark connected
    from app.db import queries
    queries.update_integration_status(workspace_id, "slack", "connected", {
        "slack_bot_token": bot_token,
        "connected_account": team_name,
    })

    # Redirect back to the frontend Integrations page
    frontend_url = settings.FRONTEND_URL.rstrip("/")
    return RedirectResponse(f"{frontend_url}/dashboard/integrations?slack=connected")


# ── Slack Channel Configuration ──────────────────────────────────

@router.get("/slack/channels")
async def list_slack_channels(workspace_id: str = Depends(get_workspace_id)):
    """Fetch available Slack channels for the admin to choose from."""
    channels = integration_service.fetch_slack_channels(workspace_id)
    return ok(channels)


class SaveChannelsIn(BaseModel):
    channel_ids: list[str]


@router.post("/slack/channels")
async def save_slack_channels(
    body: SaveChannelsIn,
    workspace_id: str = Depends(get_workspace_id),
):
    """Save the admin's selected channel IDs."""
    result = integration_service.save_slack_channels(workspace_id, body.channel_ids)
    return ok(result)


# ── Gmail OAuth Flow ─────────────────────────────────────────────

@router.get("/gmail/oauth/authorize")
async def gmail_oauth_authorize(token: str = ""):
    if not settings.GOOGLE_CLIENT_ID:
        raise HTTPException(status_code=500, detail="GOOGLE_CLIENT_ID not configured")
    if not token:
        raise HTTPException(status_code=401, detail="Missing token")
    from app.services import auth_service
    try:
        payload = auth_service.verify_token(token)
        workspace_id = payload.get("workspace_id", "")
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")
    if not workspace_id:
        raise HTTPException(status_code=401, detail="No workspace_id in token")
    params = {
        "client_id": settings.GOOGLE_CLIENT_ID,
        "redirect_uri": settings.GMAIL_REDIRECT_URI,
        "response_type": "code",
        "scope": "https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/userinfo.email openid",
        "access_type": "offline",
        "prompt": "consent",
        "state": workspace_id
    }
    url = f"https://accounts.google.com/o/oauth2/v2/auth?{urlencode(params)}"
    return RedirectResponse(url, status_code=302)


@router.get("/gmail/oauth/callback")
async def gmail_oauth_callback(code: str, state: str = ""):
    workspace_id = state
    if not workspace_id:
        raise HTTPException(status_code=400, detail="Missing state")
    async with httpx.AsyncClient() as client:
        response = await client.post(
            "https://oauth2.googleapis.com/token",
            data={
                "client_id": settings.GOOGLE_CLIENT_ID,
                "client_secret": settings.GOOGLE_CLIENT_SECRET,
                "code": code,
                "grant_type": "authorization_code",
                "redirect_uri": settings.GMAIL_REDIRECT_URI
            }
        )
    data = response.json()
    if "error" in data:
        raise HTTPException(status_code=400, detail=data.get("error_description", "OAuth failed"))
    access_token = data.get("access_token")
    refresh_token = data.get("refresh_token")
    queries.update_integration_status(workspace_id, "gmail", "connected", {
        "gmail_access_token": access_token,
        "gmail_refresh_token": refresh_token
    })
    return RedirectResponse(f"{settings.FRONTEND_URL}/dashboard/integrations?gmail=connected", status_code=302)


# ── GitHub OAuth Flow ────────────────────────────────────────────

GITHUB_OAUTH_SCOPES = "repo read:user user:email"


@router.get("/github/oauth/authorize")
async def github_oauth_authorize(token: str = ""):
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
    return RedirectResponse(url, status_code=302)


@router.get("/github/oauth/callback")
async def github_oauth_callback(code: str, state: str = ""):
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

    from app.db import queries
    queries.update_integration_status(workspace_id, "github", "connected", {
        "github_access_token": access_token,
        "connected_account": github_username,
    })

    frontend_url = settings.FRONTEND_URL.rstrip("/")
    return RedirectResponse(f"{frontend_url}/dashboard/integrations?github=connected", status_code=302)

