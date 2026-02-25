import hashlib
import hmac
import secrets
import time
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


# ── CSRF State Helpers ───────────────────────────────────────────
# We use an HMAC-signed state so there is no need for a session store.
# Format: "<timestamp_seconds>.<hmac_hex>" — valid for 10 minutes.

_STATE_TTL_SECONDS = 600  # 10 minutes


def _generate_csrf_state() -> str:
    """Generate a signed state token: '<ts>.<hmac>'."""
    ts = str(int(time.time()))
    sig = hmac.new(
        settings.JWT_SECRET_KEY.encode(),
        ts.encode(),
        hashlib.sha256,
    ).hexdigest()[:24]
    return f"{ts}.{sig}"


def _verify_csrf_state(state: str) -> bool:
    """Return True if the state is valid and not expired."""
    try:
        ts_str, sig = state.split(".", 1)
        ts = int(ts_str)
        if time.time() - ts > _STATE_TTL_SECONDS:
            return False  # expired
        expected_sig = hmac.new(
            settings.JWT_SECRET_KEY.encode(),
            ts_str.encode(),
            hashlib.sha256,
        ).hexdigest()[:24]
        return hmac.compare_digest(sig, expected_sig)
    except Exception:
        return False

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

    # --- VULN-01 FIX: Atomic-style signup with orphan cleanup ---
    workspace_id = str(uuid.uuid4())
    ws_result = sb.table("workspaces").insert({
        "id": workspace_id,
        "name": body.workspace_name,
        "timezone": "UTC",
        "risk_confidence_threshold": 70,
        "include_draft_prs": False,
        "notification_settings": {"critical_risks": True, "daily_brief": True, "new_dependencies": False},
    }).execute()

    if not ws_result.data:
        raise HTTPException(status_code=500, detail="Failed to create workspace. Please try again.")

    name = body.name
    initials = "".join(p[0].upper() for p in name.split()[:2])
    user_id = str(uuid.uuid4())
    password_hash = auth_service.hash_password(body.password)

    try:
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
    except Exception as exc:
        # Roll back the orphaned workspace so the DB stays clean
        sb.table("workspaces").delete().eq("id", workspace_id).execute()
        raise HTTPException(status_code=500, detail=f"Signup failed during user creation: {exc}")

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
    state = _generate_csrf_state()  # VULN-04 FIX: HMAC-signed CSRF state
    params = {
        "client_id": settings.GOOGLE_CLIENT_ID,
        "redirect_uri": f"{settings.APP_URL}/api/v1/auth/oauth/google/callback",
        "response_type": "code",
        "scope": "openid email profile",
        "access_type": "offline",
        "prompt": "consent",
        "state": state,
    }
    url = f"https://accounts.google.com/o/oauth2/v2/auth?{urlencode(params)}"
    return RedirectResponse(url)


@router.get("/oauth/google/callback")
async def oauth_google_callback(code: str, state: str = ""):
    """
    Exchange the Google auth code for tokens, fetch the user's profile,
    find-or-create them in public.users, issue a Sentinel JWT, and
    redirect to the frontend with the token.
    """
    from app.db.client import get_supabase

    # --- VULN-04 FIX: Validate CSRF state before doing anything ---
    if not state or not _verify_csrf_state(state):
        raise HTTPException(status_code=400, detail="Invalid or missing OAuth state (CSRF check failed)")

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
async def oauth_github_callback(code: str, state: str = ""):
    """
    Exchange the GitHub auth code for an access token, fetch the user's profile,
    find-or-create them in public.users, issue a Sentinel JWT, and redirect to frontend.
    """
    from app.db.client import get_supabase

    # --- Step 1: Exchange code for GitHub access token ---
    async with httpx.AsyncClient(timeout=15.0) as client:
        token_resp = await client.post(
            "https://github.com/login/oauth/access_token",
            json={
                "client_id": settings.GITHUB_CLIENT_ID,
                "client_secret": settings.GITHUB_CLIENT_SECRET,
                "code": code,
                "redirect_uri": f"{settings.APP_URL}/api/v1/auth/oauth/github/callback",
            },
            headers={"Accept": "application/json"},
        )
        if token_resp.status_code != 200:
            raise HTTPException(status_code=400, detail="GitHub token exchange failed")
        token_data = token_resp.json()

    access_token = token_data.get("access_token", "")
    if not access_token:
        error = token_data.get("error_description") or token_data.get("error", "unknown")
        raise HTTPException(status_code=400, detail=f"GitHub OAuth failed: {error}")

    # --- Step 2: Fetch GitHub user profile ---
    async with httpx.AsyncClient(timeout=10.0) as client:
        user_resp = await client.get(
            "https://api.github.com/user",
            headers={
                "Authorization": f"Bearer {access_token}",
                "Accept": "application/vnd.github+json",
            },
        )
        if user_resp.status_code != 200:
            raise HTTPException(status_code=400, detail="Failed to fetch GitHub user profile")
        github_user = user_resp.json()

        # GitHub may not expose email in the user object — fetch it separately
        emails_resp = await client.get(
            "https://api.github.com/user/emails",
            headers={
                "Authorization": f"Bearer {access_token}",
                "Accept": "application/vnd.github+json",
            },
        )
        email = ""
        if emails_resp.status_code == 200:
            email_list = emails_resp.json()
            primary = next((e for e in email_list if e.get("primary") and e.get("verified")), None)
            email = primary["email"] if primary else (email_list[0]["email"] if email_list else "")

    name = github_user.get("name") or github_user.get("login", "GitHub User")
    if not email:
        email = f"{github_user.get('login', 'user')}@github.noemail"

    # --- Step 3: Find or create user in public.users ---
    sb = get_supabase()
    existing = sb.table("users").select("*").ilike("email", email).maybe_single().execute()

    if existing and existing.data:
        user = existing.data
        user_id = user["id"]
        workspace_id = user.get("workspace_id", "")
    else:
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

        initials = "".join(p[0].upper() for p in name.split()[:2]) if name else "GH"
        user_id = str(uuid.uuid4())
        sb.table("users").insert({
            "id": user_id,
            "workspace_id": workspace_id,
            "name": name,
            "email": email,
            "password_hash": "",  # OAuth user — no password
            "initials": initials,
            "avatar_gradient": "from-slate-400 to-gray-600",
            "role": "admin",
            "status": "active",
        }).execute()

        _seed_integrations(sb, workspace_id)

    # --- Step 4: Issue Sentinel JWT and redirect to frontend ---
    sentinel_token = auth_service.create_access_token(user_id, workspace_id)
    redirect_url = f"{settings.FRONTEND_URL}/auth/callback?token={sentinel_token}"
    return RedirectResponse(url=redirect_url)
