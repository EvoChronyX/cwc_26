from fastapi import APIRouter

from app.api.auth import router as auth_router
from app.api.teams import router as teams_router
from app.api.buzzer import router as buzzer_router
from app.api.scores import router as scores_router
from app.api.sabotages import router as sabotages_router
from app.api.audit import router as audit_router
from app.api.rounds import router as rounds_router

api_router = APIRouter(prefix="/api")

api_router.include_router(auth_router)
api_router.include_router(teams_router)
api_router.include_router(buzzer_router)
api_router.include_router(scores_router)
api_router.include_router(sabotages_router)
api_router.include_router(audit_router)
api_router.include_router(rounds_router)

