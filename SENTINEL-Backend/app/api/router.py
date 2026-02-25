from fastapi import APIRouter
from app.api import auth, dashboard, commitments, integrations, team, notifications, settings, internal_cron
from app.api.endpoints import github

router = APIRouter(prefix="/api/v1")

router.include_router(auth.router)
router.include_router(dashboard.router)
router.include_router(commitments.router)
router.include_router(integrations.router)
router.include_router(team.router)
router.include_router(notifications.router)
router.include_router(settings.router)
router.include_router(internal_cron.router)
