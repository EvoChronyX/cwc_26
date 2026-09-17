import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.pool import StaticPool

from app.core.database import Base, get_db
from app.main import app
from app.models.sabotage import Sabotage
from app.models.game import GameSession
from app.models.admin import AdminUser
from app.core.config import settings

# Test in-memory SQLite engine
TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"

test_engine = create_async_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)

TestingSessionLocal = async_sessionmaker(
    bind=test_engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)


@pytest_asyncio.fixture(autouse=True)
async def clean_and_seed_db():
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)

    async with TestingSessionLocal() as db_session:
        session = GameSession(
            session_code=settings.DEFAULT_SESSION_CODE,
            tournament_name="Code with Comali 2026",
            current_round=1,
            round_name="Round 01 - Technical Architecture",
            buzzers_armed=True,
            is_active=True
        )
        db_session.add(session)

        admin = AdminUser(
            gm_id=settings.DEFAULT_ADMIN_GM_ID,
            username="Host Arbiter",
            password=settings.DEFAULT_ADMIN_PASSWORD,
            role="GAME_MASTER",
            is_active=True
        )
        db_session.add(admin)

        sab1 = Sabotage(name="Static Blind", slug="static-blind", description="Blur HUD", default_duration=15)
        sab2 = Sabotage(name="Sound Distortion", slug="sound-distortion", description="Distortion", default_duration=10)
        db_session.add(sab1)
        db_session.add(sab2)
        await db_session.commit()


@pytest_asyncio.fixture
async def client():
    async def override_get_db():
        async with TestingSessionLocal() as session:
            try:
                yield session
                await session.commit()
            except Exception:
                await session.rollback()
                raise
            finally:
                await session.close()

    app.dependency_overrides[get_db] = override_get_db

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac

    app.dependency_overrides.clear()
