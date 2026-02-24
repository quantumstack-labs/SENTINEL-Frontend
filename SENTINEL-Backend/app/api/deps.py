from fastapi import Header, HTTPException
from app.services import auth_service


async def get_current_user(authorization: str = Header(...)) -> dict:
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid Authorization header")
    token = authorization.removeprefix("Bearer ").strip()
    return auth_service.get_current_user(token)


async def get_workspace_id(authorization: str = Header(...)) -> str:
    user = await get_current_user(authorization)
    workspace_id = user.get("workspace_id")
    if not workspace_id:
        raise HTTPException(status_code=401, detail="No workspace associated with token")
    return workspace_id
