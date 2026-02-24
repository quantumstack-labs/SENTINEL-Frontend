from fastapi import APIRouter, Depends
from app.api.deps import get_workspace_id
from app.models.envelopes import ok
from app.services import risk_engine

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/score")
async def get_execution_score(workspace_id: str = Depends(get_workspace_id)):
    score = risk_engine.calculate_execution_score(workspace_id)
    return ok(score.model_dump(by_alias=True))


@router.get("/graph")
async def get_graph(workspace_id: str = Depends(get_workspace_id)):
    graph = risk_engine.build_graph(workspace_id)
    return ok(graph.model_dump(by_alias=True))
