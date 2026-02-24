from fastapi import APIRouter, Depends
from app.api.deps import get_workspace_id
from app.models.schemas import WorkspaceSettingsIn, WorkspaceSettingsOut, NotificationSettingsIn
from app.models.envelopes import ok, err
from app.db import queries

router = APIRouter(prefix="/workspace", tags=["Settings"])


def _row_to_settings(row: dict) -> WorkspaceSettingsOut:
    notif_raw = row.get("notification_settings") or {}
    return WorkspaceSettingsOut(
        workspace_name=row.get("name", ""),
        timezone=row.get("timezone", "UTC"),
        risk_confidence_threshold=row.get("risk_confidence_threshold", 70),
        include_draft_prs=row.get("include_draft_prs", False),
        notifications=NotificationSettingsIn(
            critical_risks=notif_raw.get("critical_risks", True),
            daily_brief=notif_raw.get("daily_brief", True),
            new_dependencies=notif_raw.get("new_dependencies", False),
        ),
    )


@router.get("/settings")
async def get_settings(workspace_id: str = Depends(get_workspace_id)):
    row = queries.fetch_workspace_settings(workspace_id)
    if not row:
        return err("Workspace not found", 404)
    return ok(_row_to_settings(row).model_dump(by_alias=True))


@router.put("/settings")
async def update_settings(body: WorkspaceSettingsIn, workspace_id: str = Depends(get_workspace_id)):
    update_data: dict = {}
    if body.workspace_name is not None:
        update_data["name"] = body.workspace_name
    if body.timezone is not None:
        update_data["timezone"] = body.timezone
    if body.risk_confidence_threshold is not None:
        update_data["risk_confidence_threshold"] = body.risk_confidence_threshold
    if body.include_draft_prs is not None:
        update_data["include_draft_prs"] = body.include_draft_prs
    if body.notifications is not None:
        update_data["notification_settings"] = body.notifications.model_dump(by_alias=False)

    row = queries.update_workspace_settings(workspace_id, update_data)
    if not row:
        row = queries.fetch_workspace_settings(workspace_id) or {}
    return ok(_row_to_settings(row).model_dump(by_alias=True))
