import asyncio
import logging
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import AsyncSessionLocal
from app.core.config import settings
from app.models.sabotage import Sabotage
from app.models.game import GameSession
from app.models.admin import AdminUser
from app.models.team import Team

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("cwc.seed")

DEFAULT_SABOTAGES = [
    {
        "name": "Static Blind",
        "slug": "static-blind",
        "description": "Injects heavy analog grain and severe optical blurring to target player HUD.",
        "default_duration": 15,
        "category": "DISRUPTION",
        "badge_label": "Available",
    },
    {
        "name": "Reverse Controls",
        "slug": "reverse-controls",
        "description": "Inverts buzzer touch triggers and directional multiple choice selection matrix.",
        "default_duration": 20,
        "category": "DISRUPTION",
        "badge_label": "Available",
    },
    {
        "name": "Sound Distortion",
        "slug": "sound-distortion",
        "description": "Streams 85dB filtered pink noise and synthetic radio fuzz into target earpiece.",
        "default_duration": 10,
        "category": "DISRUPTION",
        "badge_label": "Available",
    },
    {
        "name": "Buzzer Jammer",
        "slug": "buzzer-jammer",
        "description": "Artificially inserts 3.00s latency buffer upon hardware buzzer strike.",
        "default_duration": 30,
        "category": "DISRUPTION",
        "badge_label": "CRITICAL",
    },
    {
        "name": "Double Risk",
        "slug": "double-risk",
        "description": "Stake next response: +200% points or instant severe -200 deduction.",
        "default_duration": 15,
        "category": "DISRUPTION",
        "badge_label": "2X MULT",
    },
    {
        "name": "Time Drain",
        "slug": "time-drain",
        "description": "Instantly accelerates target squad's answer countdown clock.",
        "default_duration": 10,
        "category": "DISRUPTION",
        "badge_label": "Available",
    },
]

INITIAL_TEAMS = [
    {
        "team_name": "TEAM KINETIC",
        "p1_handle": "Alex Vance",
        "p2_handle": "Sarah Connor",
        "avatar_id": "avatar-1",
        "password": "kinetic_pass_2026",
        "lane": "Lane #01",
        "score": 1450,
        "r1_score": 450,
        "r2_score": 600,
        "r3_live_score": 400,
        "win_rate": "78%",
        "streak": 4,
        "status": "CONNECTED"
    },
    {
        "team_name": "TEAM VORTEX",
        "p1_handle": "Elena Rostova",
        "p2_handle": "Dmitri Volkov",
        "avatar_id": "avatar-2",
        "password": "vortex_pass_2026",
        "lane": "Lane #02",
        "score": 1200,
        "r1_score": 500,
        "r2_score": 450,
        "r3_live_score": 250,
        "win_rate": "54%",
        "streak": 1,
        "status": "CONNECTED"
    },
    {
        "team_name": "TEAM NULL POINTER",
        "p1_handle": "Marcus Thorne",
        "p2_handle": "Aria Stark",
        "avatar_id": "avatar-3",
        "password": "null_pass_2026",
        "lane": "Lane #03",
        "score": 950,
        "r1_score": 400,
        "r2_score": 350,
        "r3_live_score": 200,
        "win_rate": "42%",
        "streak": 0,
        "status": "CONNECTED"
    },
    {
        "team_name": "TEAM CYBER SPECTRE",
        "p1_handle": "Kenji Sato",
        "p2_handle": "Maya Lin",
        "avatar_id": "avatar-4",
        "password": "cyber_pass_2026",
        "lane": "Lane #04",
        "score": 750,
        "r1_score": 300,
        "r2_score": 300,
        "r3_live_score": 150,
        "win_rate": "36%",
        "streak": 0,
        "status": "CONNECTED"
    }
]


async def seed_database():
    async with AsyncSessionLocal() as db:
        logger.info("Starting database seeding...")

        # 1. Seed Sabotages
        for sab_data in DEFAULT_SABOTAGES:
            res = await db.execute(select(Sabotage).where(Sabotage.slug == sab_data["slug"]))
            existing = res.scalar_one_or_none()
            if not existing:
                sab = Sabotage(**sab_data)
                db.add(sab)
                logger.info(f"Seeded sabotage: {sab_data['name']}")

        # 2. Seed Default Game Session
        res = await db.execute(
            select(GameSession).where(GameSession.session_code == settings.DEFAULT_SESSION_CODE)
        )
        existing_session = res.scalar_one_or_none()
        if not existing_session:
            session = GameSession(
                session_code=settings.DEFAULT_SESSION_CODE,
                tournament_name="Code with Comali 2026",
                current_round=1,
                round_name="Round 01 - Technical Architecture",
                buzzers_armed=True,
                is_active=True
            )
            db.add(session)
            logger.info(f"Seeded tournament session: {session.session_code}")

        # 3. Seed Default Admin User
        res = await db.execute(
            select(AdminUser).where(AdminUser.gm_id == settings.DEFAULT_ADMIN_GM_ID)
        )
        existing_admin = res.scalar_one_or_none()
        if not existing_admin:
            admin = AdminUser(
                gm_id=settings.DEFAULT_ADMIN_GM_ID,
                username="Host Arbiter",
                password=settings.DEFAULT_ADMIN_PASSWORD,
                role="GAME_MASTER",
                is_active=True
            )
            db.add(admin)
            logger.info(f"Seeded Game Master: {admin.gm_id}")

        # 4. Seed Initial Tournament Teams
        for team_data in INITIAL_TEAMS:
            res = await db.execute(select(Team).where(Team.team_name == team_data["team_name"]))
            existing_team = res.scalar_one_or_none()
            if not existing_team:
                team = Team(**team_data)
                db.add(team)
                logger.info(f"Seeded team: {team_data['team_name']}")

        await db.commit()
        logger.info("Database seeding successfully completed.")


if __name__ == "__main__":
    asyncio.run(seed_database())
