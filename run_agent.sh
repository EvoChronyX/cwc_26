#!/usr/bin/env bash
# =============================================================================
# Clash with Code (CWC) - Tactical Linux Desktop Alert Companion Launcher
# =============================================================================
# Tailored for SSN Invente college lab systems running Ubuntu / Debian / Fedora.
#
# Usage:
#   ./run_agent.sh <TEAM_ID> [SERVER_IP:PORT]
#
# Examples:
#   ./run_agent.sh 1
#   ./run_agent.sh 2 10.6.3.27:8000
# =============================================================================

TEAM_ID=${1:-1}
SERVER_HOST=${2:-"localhost:8000"}

echo "=================================================================="
echo "  ⚔️  CLASH WITH CODE - LINUX LAB ALERT LAUNCHER"
echo "=================================================================="
echo "  Target Team ID : #$TEAM_ID"
echo "  Server Address : $SERVER_HOST"
echo "=================================================================="

# Check for python3
if ! command -v python3 &> /dev/null; then
    echo "[!] Python 3 is not installed or not in PATH."
    exit 1
fi

# Check for websocket-client
python3 -c "import websocket" 2>/dev/null
if [ $? -ne 0 ]; then
    echo "[*] Installing required 'websocket-client' package..."
    pip3 install --quiet websocket-client || sudo apt-get install -y python3-websocket
fi

# Run the tactical client agent
exec python3 client_agent.py --server "$SERVER_HOST" --team "$TEAM_ID"
