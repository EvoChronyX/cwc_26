# 🎮 Code with Comali (CWC 2026) Platform

Welcome to the **Code with Comali** interactive tournament and game platform. This repository contains the complete stack for the competition:
- **Frontend**: React 19 + Tailwind CSS + Canvas Confetti + Web Audio API (located in `frontend/`)
- **Backend**: FastAPI + WebSockets + SQLAlchemy 2.0 + Alembic (located in `backend/`)
- **Database**: PostgreSQL 16+ (Authoritative Production Database)
- **Documentation**: Authoritative schema & ER diagrams in `docs/database.md`

---

## 📋 Table of Contents
1. [Architecture Overview](#-architecture-overview)
2. [Prerequisites](#-prerequisites)
3. [Step-by-Step Setup & Run Guide](#-step-by-step-setup--run-guide)
   - [Step 1: Database Setup (PostgreSQL)](#step-1-database-setup-postgresql)
   - [Step 2: Backend Environment Configuration (.env)](#step-2-backend-environment-configuration-env)
   - [Step 3: Install Backend Dependencies](#step-3-install-backend-dependencies)
   - [Step 4: Run Alembic Database Migrations](#step-4-run-alembic-database-migrations)
   - [Step 5: Seed Baseline Tournament Data](#step-5-seed-baseline-tournament-data)
   - [Step 6: Launch the FastAPI Backend Server](#step-6-launch-the-fastapi-backend-server)
   - [Step 7: Launch the React Frontend](#step-7-launch-the-react-frontend)
4. [Alternative: Running with Docker Compose](#-alternative-running-with-docker-compose)
5. [Running Automated Tests](#-running-automated-tests)
6. [Default Tournament Credentials](#-default-tournament-credentials)
7. [API & WebSocket Endpoints Reference](#-api--websocket-endpoints-reference)

---

## 🏛 Architecture Overview

```
┌──────────────────────────────────────────────────────────┐
│                   React 19 Frontend                      │
│  • Portal Access (Dual-squad register / Admin login)     │
│  • Namma Area (Kootani, Mani Adi, Power-up Pothys)       │
│  • Admin Console (Thalaivar, Total Comalies, Kanaku)     │
└──────────────┬────────────────────────────▲──────────────┘
               │ HTTP REST Requests          │ WebSocket Telemetry (/ws)
               ▼                            │ (Queue, Scores, Sabotages)
┌───────────────────────────────────────────┴──────────────┐
│                    FastAPI Backend                       │
│  • Concurrency & Buzzer Serialization Engine             │
│  • Score Transaction & Floor Arbitrage Service           │
│  • Sabotage Lifecycle & Neutralization Engine            │
│  • WebSocket Connection Manager & Broadcast Rooms        │
└──────────────────────────┬───────────────────────────────┘
                           │ SQLAlchemy 2.0 (Async) + Alembic
                           ▼
┌──────────────────────────────────────────────────────────┐
│             PostgreSQL Authoritative Database            │
│  • teams                 • buzzer_events                 │
│  • admin_users           • sabotages & instances         │
│  • game_sessions         • score_transactions & audit    │
└──────────────────────────────────────────────────────────┘
```

---

## 🛠 Prerequisites

Ensure you have the following installed on your system:
- **Python**: Version 3.11 or higher (`python --version`)
- **Node.js**: Version 18 or higher with npm (`node -v` & `npm -v`)
- **PostgreSQL**: Version 15 or higher (or Docker)

---

## 🚀 Step-by-Step Setup & Run Guide

### Step 1: Database Setup (PostgreSQL)

#### ❓ Why We Do This:
PostgreSQL is the **authoritative production database** for the competition. It provides ACID transaction guarantees and row-level locking (`SELECT ... FOR UPDATE`), ensuring that competition-critical operations (such as microsecond buzzer ordering and point adjustments) are race-condition-proof.

#### 💻 How to Do It:
Open your PostgreSQL terminal (or pgAdmin / GUI) and create a database named `cwc_db`:

```sql
CREATE DATABASE cwc_db;
```

---

### Step 2: Backend Environment Configuration (`.env`)

#### ❓ Why We Do This:
In compliance with strict database security rules, database passwords, connection strings, and secret keys must **never be hardcoded or committed to Git**. We use an environment file (`.env`) that is ignored by Git via `.gitignore`.

#### 💻 How to Do It:
1. Navigate to the `backend/` directory:
   ```powershell
   cd backend
   ```
2. Copy the template `.env.example` to create your active `.env`:
   ```powershell
   cp .env.example .env
   ```
3. Open `.env` and verify or update your PostgreSQL credentials:
   ```env
   DATABASE_URL=postgresql+asyncpg://postgres:your_password@localhost:5432/cwc_db
   DATABASE_URL_SYNC=postgresql://postgres:your_password@localhost:5432/cwc_db
   SECRET_KEY=cwc_tournament_2026
   ```

---

### Step 3: Install Backend Dependencies

#### ❓ Why We Do This:
Installs the required Python packages for running FastAPI, async PostgreSQL connectivity (`asyncpg`), SQLAlchemy 2.0, Alembic migrations, Uvicorn ASGI server, and WebSockets.

#### 💻 How to Do It:
From the `backend/` folder (optionally inside a virtual environment):
```powershell
# (Optional) Create and activate a virtual environment:
python -m venv .venv
.venv\Scripts\activate

# Install all required dependencies:
pip install -r requirements.txt
```

---

### Step 4: Run Alembic Database Migrations

#### ❓ Why We Do This:
We **never create database tables manually or in an ad-hoc manner**. Alembic executes the official version-controlled schema revision (`0001_initial_cwc_schema.py`) to construct all 8 tables, indexes, check constraints, foreign keys, and unique constraints cleanly.

#### 💻 How to Do It:
From the `backend/` folder:
```powershell
alembic upgrade head
```

*Expected result:* Alembic applies revision `0001_initial_cwc_schema` and creates all tables (`teams`, `admin_users`, `game_sessions`, `buzzer_events`, `sabotages`, `sabotage_instances`, `score_transactions`, `audit_logs`).

---

### Step 5: Seed Baseline Tournament Data

#### ❓ Why We Do This:
Pre-populates the database with essential tournament baseline data:
1. The **6 tactical sabotages** (*Static Blind*, *Reverse Controls*, *Sound Distortion*, *Buzzer Jammer*, *Double Risk*, *Time Drain*).
2. The **default tournament session** (`STG-TOURNAMENT-2025-Q1`).
3. The **Game Master account** (`GM_ARBITER_07`).
4. The initial **4 tournament teams** for quick demonstration and testing.

#### 💻 How to Do It:
From the `backend/` folder:
```powershell
python -m app.seed
```

---

### Step 6: Launch the FastAPI Backend Server

#### ❓ Why We Do This:
Starts the high-performance asynchronous FastAPI server powered by Uvicorn. This serves all REST API endpoints for authentication, scoring, and buzzer management, and accepts real-time WebSocket connections on `/ws`.

#### 💻 How to Do It:
From the `backend/` folder:
```powershell
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

*Verify:*
- **Interactive Swagger API Docs**: Open [http://localhost:8000/docs](http://localhost:8000/docs) in your browser.
- **Healthcheck Endpoint**: Open [http://localhost:8000/health](http://localhost:8000/health).
- **WebSocket Endpoint**: Accessible at `ws://localhost:8000/ws`.

---

### Step 7: Launch the React Frontend

#### ❓ Why We Do This:
Starts the Vite development server hosting the user interface for both players and the Game Master.

#### 💻 How to Do It:
Open a **new terminal window**:
1. Navigate to the `frontend/` directory:
   ```powershell
   cd frontend
   ```
2. Install npm dependencies (if not already installed):
   ```powershell
   npm install
   ```
3. Start the Vite dev server:
   ```powershell
   npm run dev
   ```

*Verify:*
- Open your browser at [http://localhost:5173](http://localhost:5173).
- **Player Mode**: Register/Login your 2-player squad and enter *Namma Area*.
- **Game Master Mode**: Click "Game Master" on the login screen to open the *Admin Console*.

---

## 🐳 Alternative: Running with Docker Compose

If you have Docker and Docker Compose installed, you can launch the complete PostgreSQL 16 database and FastAPI backend with a single command:

```powershell
cd backend
docker compose up --build
```

#### ❓ Why We Do This:
Docker Compose automatically boots an isolated PostgreSQL 16 container, waits until the database healthcheck passes, runs Alembic migrations, executes the seed script, and starts the FastAPI server on port `8000`.

---

## 🧪 Running Automated Tests

A comprehensive automated test suite validates authentication, scoring, buzzer queues, concurrency, and sabotages:

```powershell
cd backend
python -m pytest tests -v
```

*Expected output:*
```
tests/test_auth.py::test_player_registration_and_login PASSED            [ 16%]
tests/test_auth.py::test_admin_login PASSED                              [ 33%]
tests/test_buzzer.py::test_buzzer_lifecycle_and_queue PASSED             [ 50%]
tests/test_sabotages.py::test_sabotage_deployment_and_neutralization PASSED [ 66%]
tests/test_scores.py::test_admin_score_adjustments PASSED                [ 83%]
tests/test_websocket.py::test_concurrent_buzzer_strikes PASSED           [100%]
============================== 6 passed in 0.33s ==============================
```

---

## 🔑 Default Tournament Credentials

Per competition configuration, passwords are stored directly without encryption:

| Role | Identifier / Name | Default Access Key / Password | Access View |
| :--- | :--- | :--- | :--- |
| **Game Master (Admin)** | `GM_ARBITER_07` | `admin_master_key_2026` | Admin Console (`#admin`) |
| **Team 1** | `TEAM KINETIC` | `kinetic_pass_2026` | Namma Area (`#arena`) |
| **Team 2** | `TEAM VORTEX` | `vortex_pass_2026` | Namma Area (`#arena`) |
| **Team 3** | `TEAM NULL POINTER` | `null_pass_2026` | Namma Area (`#arena`) |
| **Team 4** | `TEAM CYBER SPECTRE` | `cyber_pass_2026` | Namma Area (`#arena`) |

---

## 📡 API & WebSocket Endpoints Reference

### REST Endpoints:
- `POST /api/auth/player/register-or-login`: Register or authenticate a 2-player squad.
- `POST /api/auth/admin/login`: Game Master authentication.
- `GET /api/teams`: Get all teams sorted by points with active sabotages.
- `POST /api/buzzer/buzz`: Strike the buzzer (Mani Adi).
- `GET /api/buzzer/queue`: Get current buzzer triage queue.
- `POST /api/buzzer/arm`: Arm the master buzzer circuit (Admin).
- `POST /api/buzzer/lock`: Freeze/lock buzzers (Admin).
- `POST /api/buzzer/reset`: Flush buzzer queue for next question (Admin).
- `POST /api/buzzer/advance`: Advance to next pressed contender in queue (Admin).
- `POST /api/scores/adjust`: Adjust team score by `±delta` with transaction ledger.
- `POST /api/scores/floor-grant`: Award fastest floor points (+50).
- `GET /api/sabotages`: Fetch 6 disruption cards in Power-up Pothys armory.
- `POST /api/sabotages/deploy`: Deploy disruption against rival team.
- `POST /api/sabotages/neutralize`: Admin defuse/remove sabotage on a team.
- `GET /api/audit/logs`: Chronological audit logs (Kanaku Valaku).
- `GET /api/audit/export-csv`: Export audit records to CSV.

### Real-Time WebSocket (`/ws`):
- Connect: `ws://localhost:8000/ws?token=<jwt_token>`
- Events: `INIT_STATE`, `BUZZERS_STATE_CHANGED`, `QUEUE_UPDATED`, `QUEUE_ADVANCED`, `SCORE_UPDATED`, `LEADERBOARD_UPDATED`, `SABOTAGE_DEPLOYED`, `SABOTAGE_NEUTRALIZED`, `AUDIT_LOG_APPENDED`.
