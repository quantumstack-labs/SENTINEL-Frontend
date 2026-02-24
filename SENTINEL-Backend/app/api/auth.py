import uuid
import httpx
from fastapi import APIRouter, HTTPException
from fastapi.responses import RedirectResponse
from pydantic import BaseModel
from urllib.parse import urlencode
from app.models.schemas import LoginIn, TokenOut, RefreshIn
from app.models.envelopes import ok, err
from app.services import auth_service
from app.config import settings

router = APIRouter(prefix="/auth", tags=["Auth"])


class SignupIn(BaseModel):
    email: str
    password: str
    name: str = "Admin"
    workspace_name: str = "My Workspace"


@router.post("/signup")
async def signup(body: SignupIn):
    from app.db.client import get_supabase
    sb = get_supabase()

    existing = sb.table("users").select("id").eq("email", body.email).execute()
    if existing.data:
        raise HTTPException(status_code=409, detail="Email already registered")

    workspace_id = str(uuid.uuid4())
    sb.table("workspaces").insert({
        "id": workspace_id,
        "name": body.workspace_name,
        "timezone": "UTC",
        "risk_confidence_threshold": 70,
        "include_draft_prs": False,
        "notification_settings": {"critical_risks": True, "daily_brief": True, "new_dependencies": False},
    }).execute()

    name = body.name
    initials = "".join(p[0].upper() for p in name.split()[:2])
    user_id = str(uuid.uuid4())
    password_hash = auth_service.hash_password(body.password)
    sb.table("users").insert({
        "id": user_id,
        "workspace_id": workspace_id,
        "name": name,
        "email": body.email,
        "password_hash": password_hash,
        "initials": initials,
        "avatar_gradient": "from-amber-400 to-orange-500",
        "role": "admin",
        "status": "active",
    }).execute()

    _seed_integrations(sb, workspace_id)

    access_token = auth_service.create_access_token(user_id, workspace_id)
    refresh_token = auth_service.create_refresh_token(user_id, workspace_id)
    return ok(TokenOut(access_token=access_token, refresh_token=refresh_token))


def _seed_integrations(sb, workspace_id: str):
    integrations = [
        ("slack", "Slack", "Monitor Slack channels for commitment signals"),
        ("gmail", "Gmail", "Analyze email threads for commitments"),
        ("google-calendar", "Google Calendar", "Detect missed meetings and deadline conflicts"),
        ("notion", "Notion", "Connect shared Notion docs and project pages"),
        ("jira", "Jira", "Sync sprint issues and track delivery risk"),
        ("linear", "Linear", "Import Linear issues and cycle commitments"),
        ("microsoft", "Microsoft Teams", "Monitor Teams channels for commitments"),
    ]
    for int_id, int_name, int_desc in integrations:
        sb.table("integrations").upsert({
            "id": int_id,
            "workspace_id": workspace_id,
            "name": int_name,
            "icon": int_id,
            "status": "disconnected",
            "description": int_desc,
        }, on_conflict="id,workspace_id").execute()


@router.post("/login")
async def login(body: LoginIn):
    user = auth_service.authenticate_user(body.email, body.password)
    workspace_id = user.get("workspace_id", "")
    access_token = auth_service.create_access_token(user["id"], workspace_id)
    refresh_token = auth_service.create_refresh_token(user["id"], workspace_id)
    return ok(TokenOut(access_token=access_token, refresh_token=refresh_token))


@router.post("/refresh")
async def refresh(body: RefreshIn):
    payload = auth_service.verify_token(body.refresh_token)
    if payload.get("type") != "refresh":
        raise HTTPException(status_code=401, detail="Invalid token type")
    access_token = auth_service.create_access_token(payload["sub"], payload["workspace_id"])
    refresh_token = auth_service.create_refresh_token(payload["sub"], payload["workspace_id"])
    return ok(TokenOut(access_token=access_token, refresh_token=refresh_token))


@router.post("/logout")
async def logout():
    return ok({"message": "Logged out successfully"})


@router.get("/oauth/google")
async def oauth_google():
    params = {
        "client_id": settings.GOOGLE_CLIENT_ID,
        "redirect_uri": f"{settings.APP_URL}/api/v1/auth/oauth/google/callback",
        "response_type": "code",
        "scope": "openid email profile",
        "access_type": "offline",
        "prompt": "consent",
    }
    url = f"https://accounts.google.com/o/oauth2/v2/auth?{urlencode(params)}"
    return RedirectResponse(url)


@router.get("/oauth/google/callback")
async def oauth_google_callback(code: str):
    """
    Exchange the Google auth code for tokens, fetch the user's profile,
    find-or-create them in public.users, issue a Sentinel JWT, and
    redirect to the frontend with the token.
    """
    from app.db.client import get_supabase

    # --- Step 1: Exchange code for Google tokens ---
    token_url = "https://oauth2.googleapis.com/token"
    token_payload = {
        "code": code,
        "client_id": settings.GOOGLE_CLIENT_ID,
        "client_secret": settings.GOOGLE_CLIENT_SECRET,
        "redirect_uri": f"{settings.APP_URL}/api/v1/auth/oauth/google/callback",
        "grant_type": "authorization_code",
    }

    async with httpx.AsyncClient() as client:
        token_resp = await client.post(token_url, data=token_payload)
        if token_resp.status_code != 200:
            raise HTTPException(
                status_code=400,
                detail=f"Google token exchange failed: {token_resp.text}",
            )
        tokens = token_resp.json()

        # --- Step 2: Fetch user info from Google ---
        userinfo_resp = await client.get(
            "https://www.googleapis.com/oauth2/v2/userinfo",
            headers={"Authorization": f"Bearer {tokens['access_token']}"},
        )
        if userinfo_resp.status_code != 200:
            raise HTTPException(
                status_code=400,
                detail=f"Failed to fetch Google user info: {userinfo_resp.text}",
            )
        google_user = userinfo_resp.json()

    email = google_user.get("email", "")
    name = google_user.get("name", email.split("@")[0])
    avatar_url = google_user.get("picture", "")

    # --- Step 3: Find or create user in public.users ---
    sb = get_supabase()
    existing = sb.table("users").select("*").ilike("email", email).maybe_single().execute()

    if existing and existing.data:
        # Existing user — grab their IDs
        user = existing.data
        user_id = user["id"]
        workspace_id = user.get("workspace_id", "")
    else:
        # New user — create workspace + user
        workspace_id = str(uuid.uuid4())
        sb.table("workspaces").insert({
            "id": workspace_id,
            "name": f"{name}'s Workspace",
            "timezone": "UTC",
            "risk_confidence_threshold": 70,
            "include_draft_prs": False,
            "notification_settings": {
                "critical_risks": True,
                "daily_brief": True,
                "new_dependencies": False,
            },
        }).execute()

        initials = "".join(p[0].upper() for p in name.split()[:2]) if name else "U"
        user_id = str(uuid.uuid4())
        sb.table("users").insert({
            "id": user_id,
            "workspace_id": workspace_id,
            "name": name,
            "email": email,
            "password_hash": "",           # OAuth user — no password
            "initials": initials,
            "avatar_gradient": "from-amber-400 to-orange-500",
            "avatar_url": avatar_url,
            "role": "admin",
            "status": "active",
        }).execute()

        _seed_integrations(sb, workspace_id)

    # --- Step 4: Issue Sentinel JWT and redirect to frontend ---
    access_token = auth_service.create_access_token(user_id, workspace_id)
    redirect_url = f"{settings.FRONTEND_URL}/auth/callback?token={access_token}"
    return RedirectResponse(url=redirect_url)


@router.get("/oauth/github")
async def oauth_github():
    from urllib.parse import urlencode
    params = {
        "client_id": settings.GITHUB_CLIENT_ID,
        "redirect_uri": f"{settings.APP_URL}/api/v1/auth/oauth/github/callback",
        "scope": "read:user user:email",
    }
    url = f"https://github.com/login/oauth/authorize?{urlencode(params)}"
    from fastapi.responses import RedirectResponse
    return RedirectResponse(url)


@router.get("/oauth/github/callback")
async def oauth_github_callback(code: str):
    return ok({"message": "GitHub OAuth flow — implement token exchange", "code": code})
