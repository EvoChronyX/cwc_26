# Code with Comali Backend

FastAPI + PostgreSQL + SQLAlchemy 2.0 + Alembic + WebSockets backend for Code with Comali 2026.

For full setup instructions, architecture explanation, and step-by-step guides, please refer to the [Root README.md](../README.md).

## Quick Start (Terminal):

```powershell
# 1. Setup environment
cp .env.example .env

# 2. Run migrations
alembic upgrade head

# 3. Seed baseline tournament data
python -m app.seed

# 4. Start backend server
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

# 5. Run automated test suite
python -m pytest tests -v
```
