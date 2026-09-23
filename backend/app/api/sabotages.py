from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import get_current_team, get_current_admin
from app.models.team import Team
from app.models.admin import AdminUser
from app.schemas.sabotage import (
    SabotageDefinition,
    SabotageDeployRequest,
    PowerUpActivateRequest,
    ActiveThreatResponse,
    SabotageNeutralizeRequest
)
from app.services.sabotage_service import SabotageService

router = APIRouter(prefix="/sabotages", tags=["Sabotages & Tactical Armory"])


@router.get("", response_model=List[SabotageDefinition])
@router.get("/catalog", response_model=List[SabotageDefinition])
async def get_sabotages_catalog(db: AsyncSession = Depends(get_db)):
    catalog = await SabotageService.get_catalog(db)
    return catalog


@router.post("/deploy", response_model=ActiveThreatResponse)
async def deploy_sabotage(
    req: SabotageDeployRequest,
    current_team: Team = Depends(get_current_team),
    db: AsyncSession = Depends(get_db)
):
    if current_team.id == req.target_team_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Friendly fire prohibited: Cannot deploy sabotage against your own squad."
        )
    try:
        threat = await SabotageService.deploy_sabotage(
            db=db,
            attacker_team_id=current_team.id,
            target_team_id=req.target_team_id,
            sabotage_slug=req.sabotage_slug
        )
        return threat
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.post("/activate-powerup")
async def activate_powerup(
    req: PowerUpActivateRequest,
    current_team: Team = Depends(get_current_team),
    db: AsyncSession = Depends(get_db)
):
    try:
        res = await SabotageService.activate_powerup(
            db=db,
            team_id=current_team.id,
            powerup_slug=req.powerup_slug
        )
        return res
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))



@router.post("/neutralize")
async def neutralize_sabotage(
    req: SabotageNeutralizeRequest,
    admin: AdminUser = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    result = await SabotageService.neutralize_sabotage(
        db=db,
        target_team_id=req.target_team_id,
        sabotage_name=req.sabotage_name,
        admin_id=admin.id
    )
    return result


@router.get("/threat/{team_id}", response_model=ActiveThreatResponse)
async def get_team_threat(team_id: int, db: AsyncSession = Depends(get_db)):
    threat = await SabotageService.get_active_threat_for_team(db, team_id)
    return threat
