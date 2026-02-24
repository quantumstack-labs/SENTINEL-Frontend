from fastapi import APIRouter, Depends
from app.api.deps import get_workspace_id, get_current_user
from app.models.envelopes import ok
from app.services import notification_service

router = APIRouter(prefix="/notifications", tags=["Notifications"])


@router.get("")
async def list_notifications(workspace_id: str = Depends(get_workspace_id)):
    notifications = notification_service.get_notifications(workspace_id)
    return ok([n.model_dump(by_alias=True) for n in notifications])


@router.post("/mark-all-read")
async def mark_all_read(workspace_id: str = Depends(get_workspace_id)):
    result = notification_service.mark_all_read(workspace_id)
    return ok(result)
