# Code with Comali Backend

FastAPI + PostgreSQL + SQLAlchemy 2.0 + Alembic + WebSockets backend for Code with Comali 2026.

For full setup instructions, architecture explanation, and step-by-step guides, please refer to the [Root README.md](../README.md) and [Database Architecture Spec (docs/database.md)](../docs/database.md).

## Quick Start (Terminal):

```powershell
# 1. Setup environment
cp .env.example .env

# 2. Run migrations
alembic upgrade head

# 3. Seed baseline tournament data & sabotages catalog
python -m app.seed

# 4. Start backend server
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

# 5. Run automated test suite
python -m pytest tests -v
```

---

## Database Architecture & Authoritative Models

The PostgreSQL database (`cwc_db`) is the single authoritative source of truth:

| Table | Model Class | Description & Key Schema Fields |
| :--- | :--- | :--- |
| `teams` | `Team` | Competing 2-player squads. **Starting balance**: `score = 100 PTS`. Includes `r0_score` (Mani Adi buzzer points), `r1_score`, `r2_score`, `r3_live_score`, `lane`, `avatar_id`, `status`. |
| `game_sessions` | `GameSession` | Tournament session tracking. Includes `buzzers_armed`, `buzzers_armed_at`, `round1_unlocked` (Round 1 arsenal lock toggle), `round2_unlocked` (Round 2 arsenal lock toggle), `current_round`, `round_name`. |
| `buzzer_events` | `BuzzerEvent` | Microsecond buzzer triage queue. Contains `server_timestamp`, `latency_seconds`, `client_timestamp_str`, `raw_client_ms`, `queue_rank`, `status`, `is_resolved`. |
| `sabotages` | `Sabotage` | Master catalog seeded with 42 authentic items from the official tournament points system. Includes `item_type` (`POWERUP` vs `SABOTAGE`), `round_number` (`1` or `2`), `cost` (20 to 150 PTS), `level` (`Easy`, `Medium`, `Hard`), and `duration_effect`. |
| `sabotage_instances` | `SabotageInstance` | Live and historical tactical payload deployments and countdown windows with admin neutralization auditing. |
| `score_transactions` | `ScoreTransaction` | Immutable ledger of every single score mutation, delta, resulting balance, and authorizing actor. |
| `audit_logs` | `AuditLog` | *Kanaku Valaku* chronological telemetry and action stream with real-time WebSocket sync and CSV export. |
| `admin_users` | `AdminUser` | Tournament Game Master / Arbiter credentials and permissions. |

### Migration History (Alembic)
1. `0001_initial_cwc_schema`: Base normalized tables for teams, admin users, game sessions, buzzer triage, score transactions, sabotages, and audit logs.
2. `0002_add_buzzer_client_timing`: Added `client_timestamp_str` and `raw_client_ms` for microsecond client-side timing analysis.
3. `0003_round_locks_sabotages`: Added `round1_unlocked` and `round2_unlocked` to `game_sessions`; added `r0_score` to `teams`; added `item_type`, `round_number`, `cost`, `level`, `duration_effect` to `sabotages`. Seeded all 42 authentic advantages & sabotages from `points_system.docx`.

