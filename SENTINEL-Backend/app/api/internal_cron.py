from fastapi import APIRouter, Header, HTTPException
from app.config import settings
from app.models.envelopes import ok
from app.services import ingestion_service

router = APIRouter(prefix="/internal", tags=["Internal"])


@router.post("/cron/run-pipeline")
async def run_pipeline(
    x_cron_token: str = Header(...),
):
    if x_cron_token != settings.CRON_SECRET_TOKEN:
        raise HTTPException(status_code=403, detail="Forbidden")
    print("=== [CRON] Pipeline triggered — running synchronously ===")
    await ingestion_service.run_full_pipeline()
    print("=== [CRON] Pipeline finished ===")
    return ok({"status": "pipeline_complete"})
