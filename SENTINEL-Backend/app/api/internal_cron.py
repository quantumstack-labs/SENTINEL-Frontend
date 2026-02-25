from fastapi import APIRouter, Header, HTTPException
from app.config import settings
from app.models.envelopes import ok
from app.services import ingestion_service

router = APIRouter(prefix="/internal", tags=["Internal"])

@router.post("/cron/run-pipeline")
async def run_pipeline():
    print("=== [CRON] Pipeline triggered ===")
    await ingestion_service.run_full_pipeline()
    return ok({"status": "pipeline_complete"})
