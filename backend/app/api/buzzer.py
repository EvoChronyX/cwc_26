from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import get_current_team, get_current_admin
from app.models.team import Team
from app.models.admin import AdminUser
from app.schemas.buzzer import BuzzerPressRequest, BuzzerPressResult, BuzzerQueueStateResponse
from app.services.buzzer_service import BuzzerService

router = APIRouter(prefix="/buzzer", tags=["Buzzer Arbitrage"])


@router.post("/buzz")
async def press_buzzer(
    req: BuzzerPressRequest,
    current_team: Team = Depends(get_current_team),
    db: AsyncSession = Depends(get_db)
):
    result = await BuzzerService.press_buzzer(
        db=db,
        team_id=current_team.id,
        client_timestamp=req.client_timestamp
    )
    if not result.get("success"):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=result.get("message"))
    return result


@router.get("/queue", response_model=BuzzerQueueStateResponse)
async def get_queue_state(db: AsyncSession = Depends(get_db)):
    state = await BuzzerService.get_queue_state(db)
    return state


@router.post("/arm", response_model=BuzzerQueueStateResponse)
async def arm_buzzers(
    admin: AdminUser = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    state = await BuzzerService.arm_buzzers(db=db, admin_id=admin.id)
    return state


@router.post("/lock", response_model=BuzzerQueueStateResponse)
async def lock_buzzers(
    admin: AdminUser = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    state = await BuzzerService.lock_buzzers(db=db, admin_id=admin.id)
    return state


@router.post("/reset", response_model=BuzzerQueueStateResponse)
async def reset_buzzers(
    admin: AdminUser = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    state = await BuzzerService.reset_buzzers(db=db, admin_id=admin.id)
    return state


@router.post("/advance", response_model=BuzzerQueueStateResponse)
async def advance_queue(
    admin: AdminUser = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    state = await BuzzerService.advance_queue(db=db, admin_id=admin.id)
    return state
