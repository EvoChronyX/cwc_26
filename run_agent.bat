@echo off
REM =============================================================================
REM Clash with Code (CWC) - Tactical Windows Desktop Alert Companion Launcher
REM =============================================================================
REM For student and organizer laptops running Windows 10 / 11.
REM
REM Usage:
REM   run_agent.bat <TEAM_ID> [SERVER_IP:PORT]
REM
REM Examples:
REM   run_agent.bat 1
REM   run_agent.bat 2 10.6.3.27:8000
REM =============================================================================

set TEAM_ID=%1
if "%TEAM_ID%"=="" set TEAM_ID=1

set SERVER_HOST=%2
if "%SERVER_HOST%"=="" set SERVER_HOST=localhost:8000

echo ==================================================================
echo   ⚔️  CLASH WITH CODE - WINDOWS DESKTOP ALERT LAUNCHER
echo ==================================================================
echo   Target Team ID : #%TEAM_ID%
echo   Server Address : %SERVER_HOST%
echo ==================================================================

python -c "import websocket" 2>nul
if %errorlevel% neq 0 (
    echo [*] Installing required 'websocket-client' package...
    pip install websocket-client
)

echo [*] Launching CWC Companion...
python client_agent.py --server %SERVER_HOST% --team %TEAM_ID%
pause
