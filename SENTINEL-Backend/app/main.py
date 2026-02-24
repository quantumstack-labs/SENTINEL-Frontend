from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.config import settings
from app.api.router import router
from app.models.envelopes import err
from app.api.endpoints import github

@asynccontextmanager
async def lifespan(app: FastAPI):
    from app.db.client import get_supabase
    get_supabase()
    yield


import os

IS_PRODUCTION = os.getenv("ENV") == "production"

app = FastAPI(
    title="Sentinel API",
    description="Execution Intelligence backend — extracts commitments from Slack/Gmail using Gemini AI.",
    version="1.0.0",
    lifespan=lifespan,
    docs_url=None if IS_PRODUCTION else "/docs",
    redoc_url=None if IS_PRODUCTION else "/redoc",
    openapi_url=None if IS_PRODUCTION else "/openapi.json",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
        settings.FRONTEND_URL,
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return err(str(exc), status_code=500)


@app.get("/health")
async def health():
    return {"status": "ok", "service": "sentinel-api"}


app.include_router(router)
app.include_router(github.router, prefix="/api/integrations")