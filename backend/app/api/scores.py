from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import get_current_admin
from app.models.admin import AdminUser
from app.schemas.score import ScoreAdjustRequest, FloorGrantRequest
from app.services.score_service import ScoreService

router = APIRouter(prefix="/scores", tags=["Scoring & Arbitrage"])


@router.post("/adjust")
async def adjust_score(
    req: ScoreAdjustRequest,
    admin: AdminUser = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    try:
        result = await ScoreService.adjust_score(
            db=db,
            team_id=req.team_id,
            delta=req.delta,
            reason=req.reason or "Admin Score Adjustment",
            admin_id=admin.id
        )
        return result
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.post("/floor-grant")
async def grant_floor(
    req: FloorGrantRequest,
    admin: AdminUser = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    if not req.team_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="team_id is required")
    try:
        result = await ScoreService.grant_floor(
            db=db,
            team_id=req.team_id,
            delta=req.delta,
            admin_id=admin.id
        )
        return result
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.post("/correct-answer")
async def award_correct_answer(
    req: FloorGrantRequest,
    admin: AdminUser = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    if not req.team_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="team_id is required")
    try:
        result = await ScoreService.award_correct_answer(
            db=db,
            team_id=req.team_id,
            round_number=0,
            admin_id=admin.id
        )
        return result
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
