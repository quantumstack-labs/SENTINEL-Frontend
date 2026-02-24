from fastapi import APIRouter, Depends
from app.api.deps import get_workspace_id, get_current_user
from app.models.schemas import InviteMemberIn
from app.models.envelopes import ok
from app.services import team_service

router = APIRouter(prefix="/team", tags=["Team"])


@router.get("/members")
async def list_members(workspace_id: str = Depends(get_workspace_id)):
    members = team_service.get_members(workspace_id)
    return ok([m.model_dump(by_alias=True) for m in members])


@router.post("/members/invite")
async def invite_member(body: InviteMemberIn, workspace_id: str = Depends(get_workspace_id)):
    member = team_service.invite_member(workspace_id, body.email, body.role)
    return ok(member.model_dump(by_alias=True))
