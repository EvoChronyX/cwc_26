#!/usr/bin/env python3
"""
Clash with Code (CWC) - Tactical Linux Desktop Alert Companion
--------------------------------------------------------------
Tailored specifically for college lab systems running Linux (Ubuntu / Debian / X11 / Wayland).

Features:
1. Connects to the central Arbiter WebSocket (FastAPI).
2. Listens for real-time SABOTAGE, SHIELD, and REFLECTION events for your squad.
3. Automatically triggers:
   - Native Linux desktop notifications via `notify-send -u critical`
   - Topmost Tkinter Cyber Alert Overlay directly over VS Code & terminal windows
   - Optional local video playback with `mpv --ontop` / `ffplay` / `vlc`
   - Automatic browser focus using `wmctrl` / `xdotool`

Usage:
    python3 client_agent.py --server 10.6.3.27:8000 --team 2
"""

import sys
import os
import json
import time
import argparse
import subprocess
import threading
import tkinter as tk

try:
    import websocket
except ImportError:
    print("[!] 'websocket-client' package not found.")
    print("    Install it via: pip install websocket-client")
    print("    Or on Ubuntu: sudo apt install python3-websocket")
    sys.exit(1)


# =========================================================================
# CONFIGURATION & ARGUMENT PARSING
# =========================================================================
parser = argparse.ArgumentParser(description="CWC Linux Desktop Alert Companion")
parser.add_argument("--server", default=os.getenv("SERVER_HOST", "localhost:8000"), help="Server host:port (e.g. 10.6.3.27:8000)")
parser.add_argument("--team", type=int, default=int(os.getenv("TEAM_ID", "1")), help="Your Team ID (e.g. 1, 2, 3...)")
parser.add_argument("--video-dir", default="./frontend/public/videos", help="Path to local videos directory")
args = parser.parse_args()

WS_URL = f"ws://{args.server}/ws"
MY_TEAM_ID = args.team
VIDEO_DIR = os.path.abspath(args.video_dir)


print("=" * 65)
print("  ⚔️  CLASH WITH CODE - LINUX DESKTOP ALERT COMPANION")
print("=" * 65)
print(f"[*] Target WebSocket : {WS_URL}")
print(f"[*] Monitored Team ID : #{MY_TEAM_ID}")
print(f"[*] Local Video Dir   : {VIDEO_DIR}")
print("[*] Multi-window detection active. Press Ctrl+C to terminate.")
print("=" * 65)


# =========================================================================
# NATIVE DESKTOP NOTIFIERS (Linux & Windows Support)
# =========================================================================
def send_desktop_notification(title, message, urgency="critical"):
    """Fires native desktop notification across Linux and Windows."""
    if sys.platform == "win32":
        # Windows Toast Notification via PowerShell System.Windows.Forms.NotifyIcon
        ps_script = f'''
        Add-Type -AssemblyName System.Windows.Forms
        $notify = New-Object System.Windows.Forms.NotifyIcon
        $notify.Icon = [System.Drawing.SystemIcons]::Warning
        $notify.Visible = $True
        $notify.ShowBalloonTip(6000, "{title}", "{message}", [System.Windows.Forms.ToolTipIcon]::Warning)
        Start-Sleep -Seconds 1
        $notify.Dispose()
        '''
        try:
            subprocess.Popen(["powershell", "-NoProfile", "-WindowStyle", "Hidden", "-Command", ps_script],
                             stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        except Exception:
            pass
    else:
        # Linux DBus / notify-send
        try:
            subprocess.run([
                "notify-send",
                "-u", urgency,
                "-t", "8000",
                "-a", "ClashWithCode",
                title,
                message
            ], check=False, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        except FileNotFoundError:
            pass

# Backward compatibility alias
send_linux_notification = send_desktop_notification


def focus_arena_browser():
    """Brings Chrome/Firefox/Edge arena window to focus across Linux & Windows."""
    if sys.platform == "win32":
        try:
            # Activate window via Windows Script Host COM object
            ps_cmd = "$wshell = New-Object -ComObject WScript.Shell; $null = $wshell.AppActivate('Clash With Code'); $null = $wshell.AppActivate('Arena'); $null = $wshell.AppActivate('5173')"
            subprocess.Popen(["powershell", "-NoProfile", "-WindowStyle", "Hidden", "-Command", ps_cmd],
                             stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        except Exception:
            pass
    else:
        # Linux wmctrl / xdotool
        for tool, cmd in [
            ("wmctrl", ["wmctrl", "-a", "Clash With Code"]),
            ("xdotool", ["xdotool", "search", "--onlyvisible", "--name", "Clash With Code", "windowactivate"]),
        ]:
            try:
                subprocess.run(cmd, check=False, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
                return
            except FileNotFoundError:
                continue


def play_audio_beep():
    """Plays audible warning through speaker/headphones on Linux & Windows."""
    if sys.platform == "win32":
        try:
            import winsound
            winsound.MessageBeep(winsound.MB_ICONEXCLAMATION)
            winsound.Beep(950, 160)
            winsound.Beep(1200, 200)
            return
        except Exception:
            pass
    else:
        # Linux: try pw-play (PipeWire), paplay (PulseAudio), canberra-gtk-play, or aplay (ALSA)
        try:
            sound_candidates = [
                "/usr/share/sounds/freedesktop/stereo/alarm-clock-elapsed.oga",
                "/usr/share/sounds/freedesktop/stereo/complete.oga",
                "/usr/share/sounds/freedesktop/stereo/bell.oga",
                "/usr/share/sounds/alsa/Front_Center.wav"
            ]
            sound_file = next((f for f in sound_candidates if os.path.exists(f)), None)

            cmds = []
            if sound_file:
                cmds.extend([
                    ["pw-play", sound_file],
                    ["paplay", sound_file],
                    ["aplay", sound_file],
                ])
            cmds.append(["canberra-gtk-play", "-i", "alarm-clock-elapsed"])
            cmds.append(["canberra-gtk-play", "-i", "bell"])

            for cmd in cmds:
                try:
                    res = subprocess.run(cmd, check=False, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
                    if res.returncode == 0:
                        return
                except FileNotFoundError:
                    continue
        except Exception:
            pass

    # Universal fallback to system bell
    print("\a", end="", flush=True)

# Backward compatibility alias
play_linux_beep = play_audio_beep


# =========================================================================
# TKINTER TOPMOST OVERLAY (Always-On-Top over VS Code)
# =========================================================================
active_overlay_window = None

def show_topmost_alert(title, subtitle, duration=15, is_sabotage=True):
    """Spawns an always-on-top borderless HUD window over VS Code."""
    def _run_gui():
        global active_overlay_window
        try:
            root = tk.Tk()
            active_overlay_window = root
            root.title("CWC TACTICAL ALERT")

            # Force Always-On-Top
            root.attributes("-topmost", True)
            root.overrideredirect(True) # Borderless

            # Window sizing and positioning (Top-right corner)
            w = 480
            h = 160
            sw = root.winfo_screenwidth()
            x = sw - w - 30
            y = 40
            root.geometry(f"{w}x{h}+{x}+{y}")

            bg_color = "#120507" if is_sabotage else "#07120B"
            border_color = "#FF2A3B" if is_sabotage else "#00FF85"
            accent_color = "#FFCC00" if is_sabotage else "#CCFF00"

            frame = tk.Frame(root, bg=bg_color, highlightbackground=border_color, highlightthickness=3)
            frame.pack(fill="both", expand=True)

            # Header
            lbl_type = tk.Label(frame, text="🚨 HOSTILE SABOTAGE DETECTED" if is_sabotage else "⚡ TACTICAL ADVANTAGE ACTIVE",
                                font=("Monospace", 9, "bold"), fg=accent_color, bg=bg_color)
            lbl_type.pack(anchor="w", padx=15, pady=(10, 0))

            lbl_title = tk.Label(frame, text=title.upper(), font=("Helvetica", 14, "bold"), fg="#FFFFFF", bg=bg_color)
            lbl_title.pack(anchor="w", padx=15, pady=(2, 0))

            lbl_sub = tk.Label(frame, text=subtitle, font=("Helvetica", 9), fg="#AAAAAA", bg=bg_color, wraplength=440, justify="left")
            lbl_sub.pack(anchor="w", padx=15, pady=(2, 6))

            # Countdown Timer
            time_left = [duration]
            lbl_timer = tk.Label(frame, text=f"TIME REMAINING: {duration}s", font=("Monospace", 10, "bold"), fg=border_color, bg=bg_color)
            lbl_timer.pack(anchor="w", padx=15)

            btn_close = tk.Button(frame, text="DISMISS ALERT", font=("Monospace", 8, "bold"),
                                  bg=border_color, fg="#000000", bd=0, padx=8, pady=2,
                                  command=root.destroy)
            btn_close.pack(anchor="e", padx=15, pady=(0, 10))

            def update_countdown():
                time_left[0] -= 1
                if time_left[0] <= 0:
                    try:
                        root.destroy()
                    except Exception:
                        pass
                else:
                    lbl_timer.config(text=f"TIME REMAINING: {time_left[0]}s")
                    root.after(1000, update_countdown)

            root.after(1000, update_countdown)
            root.mainloop()
        except Exception as e:
            print(f"[!] Tkinter overlay error: {e}")

    threading.Thread(target=_run_gui, daemon=True).start()


def launch_video_player(video_filename):
    """Launches local video using mpv / ffplay with always-on-top flag if installed."""
    video_path = os.path.join(VIDEO_DIR, video_filename)
    if not os.path.exists(video_path):
        return

    for cmd in [
        ["mpv", "--ontop", "--no-border", "--geometry=400x225-20+20", "--loop=yes", video_path],
        ["ffplay", "-alwaysontop", "-noborder", "-x", "400", "-y", "225", "-loop", "0", video_path],
        ["vlc", "--video-on-top", "--no-video-title-show", video_path]
    ]:
        try:
            subprocess.Popen(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
            return
        except FileNotFoundError:
            continue

    # Windows native player fallback
    if sys.platform == "win32":
        try:
            os.startfile(video_path)
        except Exception:
            pass


# =========================================================================
# WEBSOCKET EVENT DISPATCHER
# =========================================================================
def on_message(ws, message):
    try:
        data = json.loads(message)
    except Exception:
        return

    msg_type = data.get("type")

    # 1. Hostile Sabotage Deployed
    if msg_type == "SABOTAGE_DEPLOYED":
        target_id = data.get("targetTeamId") or data.get("targetId")
        if target_id == MY_TEAM_ID:
            sab_name = data.get("sabotageName", "Unknown Sabotage")
            duration = data.get("duration", 15)
            attacker = data.get("attackerTeamName", "Rival Squad")

            print(f"\n[🚨 SABOTAGE HIT] {sab_name} from {attacker}! Duration: {duration}s")
            send_linux_notification(f"🚨 SABOTAGE HIT: {sab_name}", f"Deployed by {attacker}! Duration: {duration}s")
            play_linux_beep()
            focus_arena_browser()
            show_topmost_alert(sab_name, f"Deployed by {attacker}! Disruption active for {duration} seconds.", duration, is_sabotage=True)

    # 2. Sabotage Blocked by Shield
    elif msg_type == "SABOTAGE_BLOCKED":
        target_id = data.get("targetTeamId") or data.get("targetId")
        attacker_id = data.get("attackerTeamId") or data.get("attackerId")

        if target_id == MY_TEAM_ID:
            sab_name = data.get("sabotageName", "Sabotage")
            attacker = data.get("attackerTeamName", "Rival")
            print(f"\n[🛡️ SHIELD DEFENSE] Absorbed {sab_name} from {attacker}!")
            send_linux_notification("🛡️ SABOTAGE BLOCKED!", f"Your tactical shield absorbed incoming attack from {attacker}!")
            play_linux_beep()
            show_topmost_alert("SHIELD DEFENSE ACTIVE", f"Incoming {sab_name} from {attacker} was completely absorbed by your shield!", 8, is_sabotage=False)

        elif attacker_id == MY_TEAM_ID:
            target = data.get("targetTeamName", "Target")
            print(f"\n[⚠️ ATTACK BLOCKED] Target {target} is protected by a shield!")
            send_linux_notification("⚠️ SABOTAGE BLOCKED!", f"Target {target} is protected by a tactical shield.")

    # 3. Sabotage Reflected by Reflective Shield
    elif msg_type == "SABOTAGE_REFLECTED":
        orig_target_id = data.get("originalTargetTeamId")
        attacker_id = data.get("attackerTeamId") or data.get("attackerId")
        sab_name = data.get("sabotageName", "Sabotage")
        duration = data.get("duration", 15)

        if orig_target_id == MY_TEAM_ID:
            attacker = data.get("attackerTeamName", "Rival")
            print(f"\n[🔄 REFLECTED] {sab_name} reflected back onto {attacker}!")
            send_linux_notification("🔄 SABOTAGE REFLECTED!", f"Deflected {sab_name} back onto {attacker}!")
            play_linux_beep()
            show_topmost_alert("SABOTAGE REFLECTED!", f"Counter-strike! {sab_name} reflected onto {attacker}!", 10, is_sabotage=False)

        elif attacker_id == MY_TEAM_ID:
            orig_target = data.get("originalTargetName", "Target")
            print(f"\n[🚨 STRUCK BY OWN SABOTAGE] Reflected back by {orig_target}!")
            send_linux_notification("🚨 STRUCK BY OWN SABOTAGE!", f"Your sabotage was reflected back onto you by {orig_target}!")
            play_linux_beep()
            focus_arena_browser()
            show_topmost_alert("REFLECTED ONTO YOU", f"Your sabotage was deflected back by {orig_target}! You are affected for {duration}s!", duration, is_sabotage=True)

    # 4. Power-up Activated
    elif msg_type == "POWERUP_ACTIVATED":
        team_id = data.get("teamId") or data.get("team_id")
        if team_id == MY_TEAM_ID:
            powerup_name = data.get("powerupName", "Advantage")
            duration = data.get("duration", 0)
            print(f"\n[⚡ ADVANTAGE] Activated {powerup_name}")
            send_linux_notification(f"⚡ ADVANTAGE ACTIVATED", f"{powerup_name} active for your squad.")
            play_linux_beep()
            show_topmost_alert(powerup_name, "Tactical advantage active for your squad.", duration or 8, is_sabotage=False)


def on_error(ws, error):
    print(f"[!] WebSocket error: {error}")


def on_close(ws, close_status_code, close_msg):
    print("[*] Connection closed. Retrying in 3 seconds...")
    time.sleep(3)
    connect()


def on_open(ws):
    print("[✓] Connected to CWC Game Telemetry Engine.")
    # Keepalive ping thread
    def ping_loop():
        while True:
            time.sleep(15)
            try:
                ws.send(json.dumps({"type": "PING"}))
            except Exception:
                break
    threading.Thread(target=ping_loop, daemon=True).start()


def connect():
    while True:
        try:
            ws = websocket.WebSocketApp(
                WS_URL,
                on_open=on_open,
                on_message=on_message,
                on_error=on_error,
                on_close=on_close
            )
            ws.run_forever()
        except KeyboardInterrupt:
            print("\n[*] Exiting CWC Linux Desktop Alert Companion.")
            sys.exit(0)
        except Exception as e:
            print(f"[!] Connection failed: {e}. Retrying in 3s...")
            time.sleep(3)


if __name__ == "__main__":
    connect()
