from fastapi import APIRouter, Depends
from app.api.deps import get_workspace_id
from app.models.envelopes import ok
from app.services import commitment_service

router = APIRouter(tags=["Commitments"])


@router.get("/commitments")
async def list_commitments(workspace_id: str = Depends(get_workspace_id)):
    commitments = commitment_service.get_commitments(workspace_id)
    return ok([c.model_dump(by_alias=True) for c in commitments])


@router.post("/commitments/{commitment_id}/nudge")
async def nudge_commitment(commitment_id: str, workspace_id: str = Depends(get_workspace_id)):
    result = commitment_service.send_nudge(commitment_id, workspace_id)
    return ok(result.model_dump(by_alias=True))


@router.post("/alerts/{commitment_id}/resolve")
async def resolve_alert(commitment_id: str, workspace_id: str = Depends(get_workspace_id)):
    result = commitment_service.resolve_alert(commitment_id, workspace_id)
    return ok(result.model_dump(by_alias=True))
