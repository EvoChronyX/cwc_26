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

---

## 🏫 College Ethernet Lab Deployment (Linux, No Code Changes)

This procedure is for a college lab in which all Linux PCs are connected to the same wired Ethernet network. Use one PC as the **server** and all other PCs as **player/client** systems.

### Client connection behavior

The frontend derives the backend address from the server address used to open the page. Therefore, clients should open the frontend at `http://SERVER_IP:5173`; their API and WebSocket requests are sent to `http://SERVER_IP:8000`. No SSH tunnel or project installation is required on player PCs.

The final arrangement is:

```text
Server PC
   PostgreSQL       127.0.0.1:5432
   FastAPI          0.0.0.0:8000
   Vite frontend    0.0.0.0:5173
          |
          | Ethernet LAN
          |
Player PCs: browser at http://SERVER_IP:5173
            API/WebSocket calls to SERVER_IP:8000
```

### 1. Decide the machine roles and get the server IP

Choose one reliable Linux PC that will remain powered on for the event. Log in to that PC and identify its wired LAN address:

```bash
ip -br addr
```

Find the address on the Ethernet interface, for example `192.168.1.50`. In the commands below, replace `SERVER_IP` with that address. Prefer a DHCP reservation or a static address so that the server address does not change during the competition.

From every player PC, verify that the server can be reached:

```bash
ping -c 4 SERVER_IP
```

If this fails, resolve the lab network connection or firewall issue before installing the application.

### 2. Install operating-system prerequisites on the server PC

The following commands are for Debian/Ubuntu-based Linux distributions. Run them on the server PC:

```bash
sudo apt update
sudo apt install -y git curl python3 python3-venv python3-pip postgresql postgresql-contrib openssh-server
sudo systemctl enable --now postgresql
sudo systemctl enable --now ssh
python3 --version
psql --version
```

The project requires Python 3.11 or newer. If `python3 --version` is older, install Python 3.11+ using the approved package source for the lab distribution before continuing. Node.js 18+ and npm are also required for the frontend. Check whether they are already installed:

```bash
node --version
npm --version
```

If they are missing or too old, install Node.js 18 or newer according to the Linux distribution's official instructions, then verify both commands again. Do not use a Node.js version below 18.

### 3. Import the project onto the server PC

Use one of these methods.

**Clone from Git:**

```bash
cd ~
git clone <YOUR_REPOSITORY_URL> INVENTE
cd ~/INVENTE
```

Replace `<YOUR_REPOSITORY_URL>` with the repository URL. If the lab has no Git access, copy the complete project folder to the server using approved removable media or an internal file share, then open a terminal in that folder:

```bash
cd ~/INVENTE
```

The server must contain at least `backend/`, `frontend/`, `README.md`, and the backend migration files under `backend/alembic/`.

### 4. Create the PostgreSQL database on the server

Create a dedicated database user and database. Choose a real password and substitute it for `CHANGE_THIS_PASSWORD` in the next command:

```bash
sudo -u postgres psql
```

Run these SQL statements at the `psql` prompt:

```sql
CREATE USER cwc_user WITH PASSWORD 'CHANGE_THIS_PASSWORD';
CREATE DATABASE cwc_db OWNER cwc_user;
\q
```

If the user or database already exists, do not create duplicates. Instead, verify the existing credentials or use a fresh database name. PostgreSQL only needs to listen locally because the FastAPI process runs on the same server PC. Do not expose port `5432` to the player PCs.

### 5. Configure and install the backend

On the server PC:

```bash
cd ~/INVENTE/backend
cp .env.example .env
nano .env
```

Set the database URLs to match the PostgreSQL username, password, and database created above. For example:

```env
DATABASE_URL=postgresql+asyncpg://cwc_user:CHANGE_THIS_PASSWORD@localhost:5432/cwc_db
DATABASE_URL_SYNC=postgresql://cwc_user:CHANGE_THIS_PASSWORD@localhost:5432/cwc_db
SECRET_KEY=replace_with_a_long_random_competition_secret
ENVIRONMENT=production
```

Do not commit or distribute the `.env` file. Install the Python dependencies inside a virtual environment:

```bash
python3 -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
```

The `(.venv)` marker should be visible in the terminal prompt. Activate this environment again with `source .venv/bin/activate` whenever a new backend terminal is opened.

### 6. Create the schema and initial tournament data

Still inside `~/INVENTE/backend`, with the virtual environment active, test the database connection and apply the official migration:

```bash
alembic upgrade head
python -m app.seed
```

The seed command creates the default game session, Game Master account, four starter teams, and sabotage catalog. It is safe to run again because existing records are checked before insertion. Confirm the backend can import and connect before starting the event:

```bash
python -m pytest tests -v
```

### 7. Install and prepare the frontend on the server

Open another terminal on the server PC:

```bash
cd ~/INVENTE/frontend
npm install
npm run build
```

The build should finish without errors. Player PCs do not need Node.js or a copy of the project if they only use a browser; the frontend is served from the server.

### 8. Open the required server firewall ports

If UFW is enabled, run this on the server PC. Replace `192.168.1.0/24` with the lab's actual Ethernet subnet if different:

```bash
sudo ufw allow from 192.168.1.0/24 to any port 8000 proto tcp
sudo ufw allow from 192.168.1.0/24 to any port 5173 proto tcp
sudo ufw status
```

Do not open port `5432` or SSH port `22` to the lab network unless they are needed for administration. If the lab firewall blocks ports `8000` or `5173`, ask the lab administrator to permit those two ports from the player subnet.

### 9. Start the server processes

Start the backend first. In a server terminal:

```bash
cd ~/INVENTE/backend
source .venv/bin/activate
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

Leave this terminal running. In a second server terminal, start the frontend so other PCs can reach it:

```bash
cd ~/INVENTE/frontend
npm run dev -- --host 0.0.0.0 --port 5173
```

Leave this terminal running too. Confirm from the server itself:

```bash
curl http://127.0.0.1:8000/health
```

The response should contain `"status":"healthy"`. From a player PC, also test:

```bash
curl http://SERVER_IP:5173
```

### 10. Prepare each player PC

Player PCs only need a supported web browser and access to the server's Ethernet IP. They do not need Python, Node.js, PostgreSQL, npm, SSH, or a copy of this project.

Verify that the server is reachable:

```bash
ping -c 4 SERVER_IP
curl http://SERVER_IP:8000/health
curl http://SERVER_IP:5173
```

The health response should contain `"status":"healthy"`, and the frontend request should return HTML.

### 11. Open the competition interface

On each player PC, open a browser and visit:

```text
http://SERVER_IP:5173
```

The browser downloads the interface from the server, and the frontend sends API and WebSocket calls to the same server IP on port `8000`. Do not open `http://localhost:5173` or `http://localhost:8000` on a player PC.

For the Game Master, open the same URL on the server PC or on another authorized PC. Use the seeded admin credentials from the credentials table above. Players can use the seeded team accounts or register/login through the player view, depending on the competition format.

Before the event, test all of the following from at least one player PC:

1. The portal loads at `http://SERVER_IP:5173`.
2. A player can log in or register.
3. The Game Master can log in.
4. The Game Master can see the teams and arm/reset the buzzer.
5. A player buzzer action appears in the Game Master view.
6. Score changes and WebSocket updates appear without refreshing.

### 12. Competition-day operating order

1. Start PostgreSQL and confirm it is running: `sudo systemctl start postgresql`.
2. Start the FastAPI backend and leave its terminal open.
3. Start the Vite frontend and leave its terminal open.
4. Open `http://SERVER_IP:5173` in every browser.
6. Have the Game Master log in and verify the correct tournament session and teams.
7. Perform one complete test buzzer action before the first official question.
8. Keep the server PC connected to power and Ethernet for the entire competition.

### 13. Stop the system after the competition

On the server PC, press `Ctrl+C` in the Vite and Uvicorn terminals. The PostgreSQL service may remain installed and stopped for the next event:

```bash
sudo systemctl stop postgresql
```

Do not delete the PostgreSQL database if the scores or audit logs must be retained. Back up the database before changing or reinstalling the server:

```bash
sudo -u postgres pg_dump cwc_db > ~/cwc_db_backup.sql
```

### 14. Troubleshooting checklist

| Symptom | Check |
| :--- | :--- |
| Player cannot open the page | Check the server IP, Ethernet connection, Vite terminal, and firewall port `5173`. |
| Page opens but login/API fails | Test `curl http://SERVER_IP:8000/health` on that player PC and check the server firewall. |
| Browser reports a CORS or network error | Confirm the page was opened as `http://SERVER_IP:5173`, not with `localhost` or `https`, and restart the backend after code/configuration changes. |
| WebSocket updates do not appear | Confirm port `8000` is reachable from the player PC and that the backend is running. |
| Backend fails to start | Activate `backend/.venv`, check `.env`, confirm PostgreSQL is running, and verify `DATABASE_URL`. |
| Migration fails | Check the PostgreSQL user/password/database, then run `alembic upgrade head` again from `backend/`. |
| Seed data is missing | Run `python -m app.seed` from `backend/` with the virtual environment active. |
| Server IP changed | Give the server a DHCP reservation/static LAN address and use the new address in the browser. |
