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
    # =========================================================================
    # ROUND 1 — ADVANTAGES (POWER-UPS) [11 items]
    # =========================================================================
    {
        "name": "Shield (5 min)",
        "slug": "r1-shield-5m",
        "description": "Provides squad immunity against incoming hostile sabotages for 5 minutes.",
        "default_duration": 300,
        "category": "ADVANTAGE",
        "badge_label": "🛡️ 5 MIN",
        "item_type": "POWERUP",
        "round_number": 1,
        "cost": 15,
        "level": "Easy",
        "duration_effect": "5 min",
    },
    {
        "name": "Shield (10 min)",
        "slug": "r1-shield-10m",
        "description": "Provides squad immunity against incoming hostile sabotages for 10 minutes.",
        "default_duration": 600,
        "category": "ADVANTAGE",
        "badge_label": "🛡️ 10 MIN",
        "item_type": "POWERUP",
        "round_number": 1,
        "cost": 25,
        "level": "Medium",
        "duration_effect": "10 min",
    },
    {
        "name": "Extra Time (+5 min)",
        "slug": "r1-extra-time-5m",
        "description": "Grants 5 extra minutes of development time to complete challenge tasks.",
        "default_duration": 300,
        "category": "ADVANTAGE",
        "badge_label": "⏱️ +5 MIN",
        "item_type": "POWERUP",
        "round_number": 1,
        "cost": 20,
        "level": "Medium",
        "duration_effect": "+5 min",
    },
    {
        "name": "Extra Time (+10 min)",
        "slug": "r1-extra-time-10m",
        "description": "Grants 10 extra minutes of development time to complete challenge tasks.",
        "default_duration": 600,
        "category": "ADVANTAGE",
        "badge_label": "⏱️ +10 MIN",
        "item_type": "POWERUP",
        "round_number": 1,
        "cost": 35,
        "level": "Hard",
        "duration_effect": "+10 min",
    },
    {
        "name": "Skip Task",
        "slug": "r1-skip-task",
        "description": "Completely removes challenge barrier by skipping 1 difficult task without point penalties.",
        "default_duration": 0,
        "category": "ADVANTAGE",
        "badge_label": "⏭️ SKIP 1",
        "item_type": "POWERUP",
        "round_number": 1,
        "cost": 40,
        "level": "Hard",
        "duration_effect": "Skip 1 task",
    },
    {
        "name": "Skip Punishment",
        "slug": "r1-skip-punishment",
        "description": "Immediately cancels 1 active punishment or organizational penalty on your squad.",
        "default_duration": 0,
        "category": "ADVANTAGE",
        "badge_label": "🚫 CANCEL",
        "item_type": "POWERUP",
        "round_number": 1,
        "cost": 25,
        "level": "Medium",
        "duration_effect": "Cancel 1 punishment",
    },
    {
        "name": "Reflecting Shield (5 min)",
        "slug": "r1-reflecting-shield-5m",
        "description": "Reflects incoming hostile sabotages back to attacker squad for 5 minutes.",
        "default_duration": 300,
        "category": "ADVANTAGE",
        "badge_label": "🔄 REFLECT 5M",
        "item_type": "POWERUP",
        "round_number": 1,
        "cost": 30,
        "level": "Medium",
        "duration_effect": "Reflect for 5 min",
    },
    {
        "name": "Reflect Shield (10 min)",
        "slug": "r1-reflect-shield-10m",
        "description": "Reflects incoming hostile sabotages back to attacker squad for 10 minutes.",
        "default_duration": 600,
        "category": "ADVANTAGE",
        "badge_label": "🔄 REFLECT 10M",
        "item_type": "POWERUP",
        "round_number": 1,
        "cost": 45,
        "level": "Hard",
        "duration_effect": "Reflect for 10 min",
    },
    {
        "name": "Check Progress (2 teams)",
        "slug": "r1-check-progress-2",
        "description": "Inspect development progress and active code metrics of 2 rival teams.",
        "default_duration": 0,
        "category": "ADVANTAGE",
        "badge_label": "👀 2 TEAMS",
        "item_type": "POWERUP",
        "round_number": 1,
        "cost": 10,
        "level": "Easy",
        "duration_effect": "Check 2 teams",
    },
    {
        "name": "Check Progress (5 teams)",
        "slug": "r1-check-progress-5",
        "description": "Inspect development progress and active code metrics of 5 rival teams.",
        "default_duration": 0,
        "category": "ADVANTAGE",
        "badge_label": "👀 5 TEAMS",
        "item_type": "POWERUP",
        "round_number": 1,
        "cost": 20,
        "level": "Medium",
        "duration_effect": "Check 5 teams",
    },
    {
        "name": "Lottery Advantage",
        "slug": "r1-lottery",
        "description": "Special surprise lottery draw: grants an unpredictable power-up advantage or opponent sabotage.",
        "default_duration": 0,
        "category": "ADVANTAGE",
        "badge_label": "🎲 LOTTERY",
        "item_type": "POWERUP",
        "round_number": 1,
        "cost": 15,
        "level": "Medium",
        "duration_effect": "Surprise Advantage",
    },

    # =========================================================================
    # ROUND 1 — SABOTAGES [10 items]
    # =========================================================================
    {
        "name": "Blackout (5 min)",
        "slug": "r1-blackout-5m",
        "description": "Forces 5-minute screen blackout and visual interface darkness on target squad.",
        "default_duration": 300,
        "category": "DISRUPTION",
        "badge_label": "🌑 5 MIN",
        "item_type": "SABOTAGE",
        "round_number": 1,
        "cost": 15,
        "level": "Medium",
        "duration_effect": "5 min",
    },
    {
        "name": "Blackout (10 min)",
        "slug": "r1-blackout-10m",
        "description": "Forces 10-minute screen blackout and visual interface darkness on target squad.",
        "default_duration": 600,
        "category": "DISRUPTION",
        "badge_label": "🌑 10 MIN",
        "item_type": "SABOTAGE",
        "round_number": 1,
        "cost": 30,
        "level": "Hard",
        "duration_effect": "10 min",
    },
    {
        "name": "No Copy Paste (5 min)",
        "slug": "r1-no-copy-paste-5m",
        "description": "Blocks clipboard copy and paste capabilities on target system for 5 minutes.",
        "default_duration": 300,
        "category": "DISRUPTION",
        "badge_label": "📋 5 MIN",
        "item_type": "SABOTAGE",
        "round_number": 1,
        "cost": 10,
        "level": "Easy",
        "duration_effect": "5 min",
    },
    {
        "name": "No Copy Paste (10 min)",
        "slug": "r1-no-copy-paste-10m",
        "description": "Blocks clipboard copy and paste capabilities on target system for 10 minutes.",
        "default_duration": 600,
        "category": "DISRUPTION",
        "badge_label": "📋 10 MIN",
        "item_type": "SABOTAGE",
        "round_number": 1,
        "cost": 20,
        "level": "Medium",
        "duration_effect": "10 min",
    },
    {
        "name": "No AI (5 min)",
        "slug": "r1-no-ai-5m",
        "description": "Disables AI assistants, code completions, and LLM tooling for target squad for 5 minutes.",
        "default_duration": 300,
        "category": "DISRUPTION",
        "badge_label": "🤖 5 MIN",
        "item_type": "SABOTAGE",
        "round_number": 1,
        "cost": 15,
        "level": "Medium",
        "duration_effect": "5 min",
    },
    {
        "name": "No AI (10 min)",
        "slug": "r1-no-ai-10m",
        "description": "Disables AI assistants, code completions, and LLM tooling for target squad for 10 minutes.",
        "default_duration": 600,
        "category": "DISRUPTION",
        "badge_label": "🤖 10 MIN",
        "item_type": "SABOTAGE",
        "round_number": 1,
        "cost": 30,
        "level": "Hard",
        "duration_effect": "10 min",
    },
    {
        "name": "Force Punishment",
        "slug": "r1-force-punishment",
        "description": "Triggers 1 compulsory organizer-designated challenge penalty on target squad.",
        "default_duration": 0,
        "category": "DISRUPTION",
        "badge_label": "⚠️ 1 PENALTY",
        "item_type": "SABOTAGE",
        "round_number": 1,
        "cost": 25,
        "level": "Medium",
        "duration_effect": "1 punishment",
    },
    {
        "name": "Freeze Them (2 min)",
        "slug": "r1-freeze-them-2m",
        "description": "Completely freezes code editor and keyboard access on target system for 2 minutes.",
        "default_duration": 120,
        "category": "DISRUPTION",
        "badge_label": "🧊 2 MIN",
        "item_type": "SABOTAGE",
        "round_number": 1,
        "cost": 10,
        "level": "Easy",
        "duration_effect": "2 min",
    },
    {
        "name": "Freeze Them (5 min)",
        "slug": "r1-freeze-them-5m",
        "description": "Completely freezes code editor and keyboard access on target system for 5 minutes.",
        "default_duration": 300,
        "category": "DISRUPTION",
        "badge_label": "🧊 5 MIN",
        "item_type": "SABOTAGE",
        "round_number": 1,
        "cost": 20,
        "level": "Medium",
        "duration_effect": "5 min",
    },
    {
        "name": "Force Task (5 min)",
        "slug": "r1-force-task-5m",
        "description": "Assigns 1 mandatory side challenge task from organizers to be completed within 5 minutes.",
        "default_duration": 300,
        "category": "DISRUPTION",
        "badge_label": "🎯 1 TASK / 5M",
        "item_type": "SABOTAGE",
        "round_number": 1,
        "cost": 30,
        "level": "Hard",
        "duration_effect": "1 task / 5 min",
    },

    # =========================================================================
    # ROUND 2 — ADVANTAGES (POWER-UPS) [13 items]
    # =========================================================================
    {
        "name": "Shield (5 min) - R2",
        "slug": "r2-shield-5m",
        "description": "Provides squad immunity against incoming hostile sabotages for 5 minutes.",
        "default_duration": 300,
        "category": "ADVANTAGE",
        "badge_label": "🛡️ 5 MIN",
        "item_type": "POWERUP",
        "round_number": 2,
        "cost": 15,
        "level": "Easy",
        "duration_effect": "5 min",
    },
    {
        "name": "Shield (10 min) - R2",
        "slug": "r2-shield-10m",
        "description": "Provides squad immunity against incoming hostile sabotages for 10 minutes.",
        "default_duration": 600,
        "category": "ADVANTAGE",
        "badge_label": "🛡️ 10 MIN",
        "item_type": "POWERUP",
        "round_number": 2,
        "cost": 25,
        "level": "Medium",
        "duration_effect": "10 min",
    },
    {
        "name": "Extra Time (+5 min) - R2",
        "slug": "r2-extra-time-5m",
        "description": "Grants 5 extra minutes of development time in Round 2.",
        "default_duration": 300,
        "category": "ADVANTAGE",
        "badge_label": "⏱️ +5 MIN",
        "item_type": "POWERUP",
        "round_number": 2,
        "cost": 20,
        "level": "Medium",
        "duration_effect": "+5 min",
    },
    {
        "name": "Extra Time (+10 min) - R2",
        "slug": "r2-extra-time-10m",
        "description": "Grants 10 extra minutes of development time in Round 2.",
        "default_duration": 600,
        "category": "ADVANTAGE",
        "badge_label": "⏱️ +10 MIN",
        "item_type": "POWERUP",
        "round_number": 2,
        "cost": 35,
        "level": "Hard",
        "duration_effect": "+10 min",
    },
    {
        "name": "Skip Task - R2",
        "slug": "r2-skip-task",
        "description": "Bypasses 1 Round 2 technical challenge task without point deduction.",
        "default_duration": 0,
        "category": "ADVANTAGE",
        "badge_label": "⏭️ SKIP 1",
        "item_type": "POWERUP",
        "round_number": 2,
        "cost": 40,
        "level": "Hard",
        "duration_effect": "Skip 1 task",
    },
    {
        "name": "Skip Punishment - R2",
        "slug": "r2-skip-punishment",
        "description": "Cancels 1 active punishment or penalty on your squad in Round 2.",
        "default_duration": 0,
        "category": "ADVANTAGE",
        "badge_label": "🚫 CANCEL",
        "item_type": "POWERUP",
        "round_number": 2,
        "cost": 25,
        "level": "Medium",
        "duration_effect": "Cancel 1 punishment",
    },
    {
        "name": "Reflect (5 min) - R2",
        "slug": "r2-reflect-5m",
        "description": "Reflects incoming hostile sabotages back to attacker squad for 5 minutes.",
        "default_duration": 300,
        "category": "ADVANTAGE",
        "badge_label": "🔄 REFLECT 5M",
        "item_type": "POWERUP",
        "round_number": 2,
        "cost": 30,
        "level": "Medium",
        "duration_effect": "5 min",
    },
    {
        "name": "Reflect (10 min) - R2",
        "slug": "r2-reflect-10m",
        "description": "Reflects incoming hostile sabotages back to attacker squad for 10 minutes.",
        "default_duration": 600,
        "category": "ADVANTAGE",
        "badge_label": "🔄 REFLECT 10M",
        "item_type": "POWERUP",
        "round_number": 2,
        "cost": 45,
        "level": "Hard",
        "duration_effect": "10 min",
    },
    {
        "name": "Get Hints (High-level)",
        "slug": "r2-get-hints-high",
        "description": "Unlocks high-level architectural insight and guidance from judges.",
        "default_duration": 0,
        "category": "ADVANTAGE",
        "badge_label": "💡 HIGH HINT",
        "item_type": "POWERUP",
        "round_number": 2,
        "cost": 15,
        "level": "Medium",
        "duration_effect": "High-level hint",
    },
    {
        "name": "Get Hints (Detailed)",
        "slug": "r2-get-hints-detail",
        "description": "Unlocks detailed step-by-step technical explanation and code path hints.",
        "default_duration": 0,
        "category": "ADVANTAGE",
        "badge_label": "💡 DETAILED",
        "item_type": "POWERUP",
        "round_number": 2,
        "cost": 25,
        "level": "Hard",
        "duration_effect": "Detailed explanation",
    },
    {
        "name": "Lottery Advantage - R2",
        "slug": "r2-lottery",
        "description": "Special surprise lottery draw: grants high-tier power-up or strategic sabotage.",
        "default_duration": 0,
        "category": "ADVANTAGE",
        "badge_label": "🎲 LOTTERY",
        "item_type": "POWERUP",
        "round_number": 2,
        "cost": 15,
        "level": "Medium",
        "duration_effect": "Surprise Advantage",
    },
    {
        "name": "Get AI (1 question)",
        "slug": "r2-get-ai",
        "description": "Grants 1 full unrestricted prompt query with generative AI coding assistance.",
        "default_duration": 0,
        "category": "ADVANTAGE",
        "badge_label": "🤖 1 AI PROMPT",
        "item_type": "POWERUP",
        "round_number": 2,
        "cost": 25,
        "level": "Medium",
        "duration_effect": "1 AI question",
    },
    {
        "name": "Change Question",
        "slug": "r2-change-question",
        "description": "Rerolls challenge question and swaps for an alternate problem specification.",
        "default_duration": 0,
        "category": "ADVANTAGE",
        "badge_label": "🔀 SWAP Q",
        "item_type": "POWERUP",
        "round_number": 2,
        "cost": 20,
        "level": "Medium",
        "duration_effect": "Change 1 question",
    },

    # =========================================================================
    # ROUND 2 — SABOTAGES [8 items]
    # =========================================================================
    {
        "name": "Blackout (5 min) - R2",
        "slug": "r2-blackout-5m",
        "description": "Forces 5-minute screen blackout and visual interface darkness on target squad.",
        "default_duration": 300,
        "category": "DISRUPTION",
        "badge_label": "🌑 5 MIN",
        "item_type": "SABOTAGE",
        "round_number": 2,
        "cost": 15,
        "level": "Medium",
        "duration_effect": "5 min",
    },
    {
        "name": "Blackout (10 min) - R2",
        "slug": "r2-blackout-10m",
        "description": "Forces 10-minute screen blackout and visual interface darkness on target squad.",
        "default_duration": 600,
        "category": "DISRUPTION",
        "badge_label": "🌑 10 MIN",
        "item_type": "SABOTAGE",
        "round_number": 2,
        "cost": 30,
        "level": "Hard",
        "duration_effect": "10 min",
    },
    {
        "name": "Force Complexity",
        "slug": "r2-force-complexity",
        "description": "Adds extra architectural complexity and strict constraints to 1 target question.",
        "default_duration": 0,
        "category": "DISRUPTION",
        "badge_label": "🧩 COMPLEX",
        "item_type": "SABOTAGE",
        "round_number": 2,
        "cost": 20,
        "level": "Medium",
        "duration_effect": "1 question",
    },
    {
        "name": "Force Punishment - R2",
        "slug": "r2-force-punishment",
        "description": "Imposes 1 penalty challenge or physical obstacle constraint on target squad in Round 2.",
        "default_duration": 0,
        "category": "DISRUPTION",
        "badge_label": "⚠️ 1 PENALTY",
        "item_type": "SABOTAGE",
        "round_number": 2,
        "cost": 25,
        "level": "Medium",
        "duration_effect": "1 punishment",
    },
    {
        "name": "Freeze Them (2 min) - R2",
        "slug": "r2-freeze-them-2m",
        "description": "Completely freezes keyboard and editor access for target squad for 2 minutes.",
        "default_duration": 120,
        "category": "DISRUPTION",
        "badge_label": "🧊 2 MIN",
        "item_type": "SABOTAGE",
        "round_number": 2,
        "cost": 10,
        "level": "Easy",
        "duration_effect": "2 min",
    },
    {
        "name": "Freeze Them (5 min) - R2",
        "slug": "r2-freeze-them-5m",
        "description": "Completely freezes keyboard and editor access for target squad for 5 minutes.",
        "default_duration": 300,
        "category": "DISRUPTION",
        "badge_label": "🧊 5 MIN",
        "item_type": "SABOTAGE",
        "round_number": 2,
        "cost": 20,
        "level": "Medium",
        "duration_effect": "5 min",
    },
    {
        "name": "Force Task (5 min) - R2",
        "slug": "r2-force-task-5m",
        "description": "Assigns 1 mandatory side challenge task from organizers to target squad within 5 minutes.",
        "default_duration": 300,
        "category": "DISRUPTION",
        "badge_label": "🎯 1 TASK / 5M",
        "item_type": "SABOTAGE",
        "round_number": 2,
        "cost": 30,
        "level": "Hard",
        "duration_effect": "1 task / 5 min",
    },
    {
        "name": "Lottery Sabotage",
        "slug": "r2-lottery-sabotage",
        "description": "Deploys a surprise hostile sabotage payload against opponent drawn from lottery pool.",
        "default_duration": 300,
        "category": "DISRUPTION",
        "badge_label": "🎲 LOTTERY",
        "item_type": "SABOTAGE",
        "round_number": 2,
        "cost": 15,
        "level": "Medium",
        "duration_effect": "Surprise Sabotage",
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
        "score": 100,
        "r0_score": 0,
        "r1_score": 0,
        "r2_score": 0,
        "r3_live_score": 0,
        "win_rate": "0%",
        "streak": 0,
        "status": "DISCONNECTED"
    },
    {
        "team_name": "TEAM VORTEX",
        "p1_handle": "Elena Rostova",
        "p2_handle": "Dmitri Volkov",
        "avatar_id": "avatar-2",
        "password": "vortex_pass_2026",
        "lane": "Lane #02",
        "score": 100,
        "r0_score": 0,
        "r1_score": 0,
        "r2_score": 0,
        "r3_live_score": 0,
        "win_rate": "0%",
        "streak": 0,
        "status": "DISCONNECTED"
    },
    {
        "team_name": "TEAM NULL POINTER",
        "p1_handle": "Marcus Thorne",
        "p2_handle": "Aria Stark",
        "avatar_id": "avatar-3",
        "password": "null_pass_2026",
        "lane": "Lane #03",
        "score": 100,
        "r0_score": 0,
        "r1_score": 0,
        "r2_score": 0,
        "r3_live_score": 0,
        "win_rate": "0%",
        "streak": 0,
        "status": "DISCONNECTED"
    },
    {
        "team_name": "TEAM CYBER SPECTRE",
        "p1_handle": "Kenji Sato",
        "p2_handle": "Maya Lin",
        "avatar_id": "avatar-4",
        "password": "cyber_pass_2026",
        "lane": "Lane #04",
        "score": 100,
        "r0_score": 0,
        "r1_score": 0,
        "r2_score": 0,
        "r3_live_score": 0,
        "win_rate": "0%",
        "streak": 0,
        "status": "DISCONNECTED"
    }
]


async def seed_database():
    async with AsyncSessionLocal() as db:
        logger.info("Starting database seeding...")

        # 1. Seed or update Sabotages & Advantages Catalog
        for sab_data in DEFAULT_SABOTAGES:
            res = await db.execute(select(Sabotage).where(Sabotage.slug == sab_data["slug"]))
            existing = res.scalar_one_or_none()
            if not existing:
                sab = Sabotage(**sab_data)
                db.add(sab)
                logger.info(f"Seeded item: {sab_data['name']}")
            else:
                for key, val in sab_data.items():
                    setattr(existing, key, val)
                logger.info(f"Updated item: {sab_data['name']}")

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
                round1_unlocked=False,
                round2_unlocked=False,
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

        # 4. Seed Initial Tournament Teams with 100 starting points
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
