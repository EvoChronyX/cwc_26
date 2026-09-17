from typing import List, Union
from pydantic import AnyHttpUrl, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # Application Info
    APP_NAME: str = "Code with Comali Tournament Backend"
    APP_VERSION: str = "1.0.0"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True

    # Database
    DATABASE_URL: str = "postgresql+asyncpg://cwc_user:cwc_password@localhost:5432/cwc_db"
    DATABASE_URL_SYNC: str = "postgresql://cwc_user:cwc_password@localhost:5432/cwc_db"

    @field_validator("DATABASE_URL", mode="before")
    @classmethod
    def assemble_async_db_connection(cls, v: str) -> str:
        if isinstance(v, str):
            # Normalize prefix to asyncpg for async SQLAlchemy
            if v.startswith("postgres://"):
                v = v.replace("postgres://", "postgresql+asyncpg://", 1)
            elif v.startswith("postgresql://") and not v.startswith("postgresql+asyncpg://"):
                v = v.replace("postgresql://", "postgresql+asyncpg://", 1)
        return v

    # Security & Tokens
    SECRET_KEY: str = "cwc_tournament_secret_key_change_in_production_2026"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours

    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
        "*"
    ]

    # Defaults
    DEFAULT_SESSION_CODE: str = "STG-TOURNAMENT-2025-Q1"
    DEFAULT_ADMIN_GM_ID: str = "GM_ARBITER_07"
    DEFAULT_ADMIN_PASSWORD: str = "admin_master_key_2026"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="allow"
    )


settings = Settings()
