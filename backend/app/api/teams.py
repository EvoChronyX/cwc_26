from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.models.team import Team
from app.schemas.team import TeamResponse
from app.services.score_service import ScoreService

router = APIRouter(prefix="/teams", tags=["Teams & Standings"])


@router.get("", response_model=List[TeamResponse])
async def get_all_teams(db: AsyncSession = Depends(get_db)):
    teams = await ScoreService.get_all_teams(db)
    return teams


@router.get("/{team_id}", response_model=TeamResponse)
async def get_team_by_id(team_id: int, db: AsyncSession = Depends(get_db)):
    teams = await ScoreService.get_all_teams(db)
    for t in teams:
        if t["id"] == team_id:
            return t
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Team not found")
