# Clash with Code (CWC) - Tactical Video & Multi-Window Alert Setup Guide

This guide details the video storage architecture, file naming conventions, encoding specifications for minimal latency over local college Ethernet, and instructions for multi-window alerts on Linux lab systems.

---

## 1. Zero-Latency Video Storage Architecture

All video files are hosted locally within the frontend application:
```
d:/SSN/INVENTE/frontend/public/videos/
├── sabotages/
│   ├── blackout.mp4
│   ├── no-copy-paste.mp4
│   ├── no-ai.mp4
│   ├── freeze.mp4
│   ├── force-task.mp4
│   ├── punishment.mp4
│   ├── complexity.mp4
│   └── default_sabotage.mp4
│
├── powerups/
│   ├── extra-time.mp4
│   ├── skip-task.mp4
│   ├── skip-punishment.mp4
│   ├── hints.mp4
│   ├── lottery.mp4
│   ├── ai.mp4
│   ├── change-question.mp4
│   ├── check-progress.mp4
│   └── default_powerup.mp4
│
└── shields/
    ├── shield-active.mp4
    ├── shield-blocked.mp4
    ├── reflect-active.mp4
    └── reflect-counter.mp4
```

### Why Storing Locally in `public/videos/` Provides Lowest Latency
- When Vite / static web servers serve files from `/public/`, videos are streamed over the college 100M/1G Ethernet at sub-millisecond local latency.
- No external internet bandwidth is consumed.
- Browsers automatically cache the video files after the first load.

---

## 2. Recommended Video Encoding Specifications

To guarantee instantaneous startup and low CPU overhead on college Linux lab systems:

| Parameter | Recommended Setting | Rationale |
| :--- | :--- | :--- |
| **Container Format** | `.mp4` or `.webm` | Supported by Chrome, Chromium, and Firefox on Linux |
| **Video Codec** | **H.264 (AVC)** | Hardware accelerated on all Intel/AMD integrated GPUs |
| **Resolution** | **1280 x 720 (720p)** or **1920 x 1080 (1080p)** | Optimal balance of crisp visuals and small file size |
| **Framerate** | **30 FPS** | Smooth motion without heavy decode load |
| **Video Bitrate** | **1,500 kbps to 2,500 kbps** | Keeps file size small (~5MB - 12MB per video) |
| **Audio Codec** | **AAC** (Stereo, 128 kbps, 44.1 kHz) | Standard audio playback |
| **Fast Start** | Enabled (`+faststart` in FFmpeg) | Moves `moov` atom to start for instant playback |

### Quick FFmpeg Command to Encode Any Video for Lowest Latency:
```bash
ffmpeg -i input.mp4 -c:v libx264 -preset fast -crf 22 -c:a aac -b:a 128k -movflags +faststart output.mp4
```

---

## 3. Video File Mapping Matrix

| Category | File Path | When It Plays |
| :--- | :--- | :--- |
| **Blackout** | `public/videos/sabotages/blackout.mp4` | When Blackout (5m or 10m) is deployed on a victim squad |
| **No Copy-Paste** | `public/videos/sabotages/no-copy-paste.mp4` | When Clipboard Lock is deployed |
| **No AI** | `public/videos/sabotages/no-ai.mp4` | When AI assistants are disabled |
| **Freeze Them** | `public/videos/sabotages/freeze.mp4` | When Editor Freeze (2m or 5m) is deployed |
| **Force Task** | `public/videos/sabotages/force-task.mp4` | When Forced Task (5m) is deployed |
| **Force Punishment**| `public/videos/sabotages/punishment.mp4` | When Penalty Challenge is deployed |
| **Force Complexity**| `public/videos/sabotages/complexity.mp4` | When Complexity constraint is deployed |
| **Extra Time** | `public/videos/powerups/extra-time.mp4` | When Extra Time (+5m or +10m) is activated |
| **Skip Task** | `public/videos/powerups/skip-task.mp4` | When Skip Task powerup is activated |
| **Skip Punishment**| `public/videos/powerups/skip-punishment.mp4`| When Skip Punishment is activated |
| **Hints** | `public/videos/powerups/hints.mp4` | When Judge Hints are unlocked |
| **Lottery** | `public/videos/powerups/lottery.mp4` | When Surprise Lottery is rolled |
| **AI Prompt** | `public/videos/powerups/ai.mp4` | When AI prompt assistance is unlocked |
| **Change Question**| `public/videos/powerups/change-question.mp4`| When Question Swap is activated |
| **Check Progress** | `public/videos/powerups/check-progress.mp4`| When Radar Progress check is activated |
| **Shield Active** | `public/videos/shields/shield-active.mp4` | When Defensive Shield (5m or 10m) is purchased |
| **Shield Blocked** | `public/videos/shields/shield-blocked.mp4`| When a sabotage hits a squad protected by a Shield |
| **Reflect Active** | `public/videos/shields/reflect-active.mp4`| When Reflective Shield (5m or 10m) is purchased |
| **Reflect Counter**| `public/videos/shields/reflect-counter.mp4`| When an attack is reflected back onto the attacker |

---

## 4. Built-in Cyberpunk Canvas Simulator (Zero-Asset Fallback)

If an MP4 video has not been placed in the folder yet:
- The app **will NOT crash or display a black broken box**.
- It automatically activates the **Cyberpunk Canvas HUD Simulator**.
- An animated radar sweep, hexagonal particle force-field, and emergency flashing warning badge with live countdown timer will display seamlessly until you drop in the `.mp4` file.

---

---

## 5. Multi-Window Alert Architecture for Linux Lab Machines

Because many participant systems run **Linux** (Ubuntu / Debian / Fedora) with students actively coding inside external applications like **VS Code** or terminal editors:

### Layer 1: HTML5 Picture-in-Picture (PiP Always-On-Top Window)
- In the video modal, players can click **"Keep on Screen (PiP)"** or **"Pin Over VS Code"**.
- Linux display servers (**X11** and **Wayland**) treat HTML5 Picture-in-Picture as an Always-On-Top OS window (`_NET_WM_STATE_ABOVE` on X11 and overlay surface on Wayland).
- It remains pinned in the corner directly floating over VS Code, terminal windows, and IDEs.
- **Canvas Fallback Streaming**: Even if an MP4 has not yet been placed in the folder, the built-in Cyberpunk Canvas stream binds to the PiP window so participants still get an always-on-top countdown HUD over VS Code!

### Layer 2: Native Linux Desktop Notifications (`org.freedesktop.Notifications`)
- The web arena requests standard Web Notification permissions upon joining.
- When an incoming sabotage strikes while the browser is blurred or in the background, a native desktop notification toast pops up via the Linux desktop notification daemon (**GNOME Shell**, **Dunst**, **Mako**, **XFCE4-Notifyd**, or **KDE Plasma**).
- Includes `requireInteraction: true`, `tag: 'cwc-alert'`, and `renotify: true` to prevent notifications from prematurely timing out while coding.
- Clicking the notification immediately brings the web arena browser tab to the front.

### Layer 3: PulseAudio / PipeWire Tactical Alarm Siren
- A loud, piercing synthesizer siren tone plays directly through the Linux audio server (**PipeWire** / **PulseAudio** / **ALSA**).
- Audio plays even when the browser tab is hidden or minimized.
- The browser tab title flashes `🚨 SABOTAGE HIT! 🚨` in the Linux panel/dock.

### Layer 4: Tactical Linux Desktop Companion Agent (`client_agent.py` & `run_agent.sh`)
For college lab systems where maximum disruption is desired directly over VS Code:
1. Start the companion with a single command on the lab PC:
   ```bash
   ./run_agent.sh <TEAM_ID> [SERVER_IP:8000]
   ```
   *Example for Team 2 connecting to main server `10.6.3.27`:*
   ```bash
   ./run_agent.sh 2 10.6.3.27:8000
   ```
2. The agent listens directly to the telemetry WebSocket and on sabotage:
   - Dispatches `notify-send -u critical`
   - Spawns a borderless `-topmost` Cyber Alert Tkinter HUD directly over VS Code
   - Automatically raises the browser using `wmctrl` or `xdotool` if present
   - Plays alarm sound via `pw-play`, `paplay`, `canberra-gtk-play`, or `aplay`

---

## 6. Multi-Window Alert Architecture for Windows Machines

For students and organizers running **Windows 10** or **Windows 11**:

### Layer 1: HTML5 Picture-in-Picture (PiP Always-On-Top Window)
- Supported natively in **Google Chrome**, **Microsoft Edge**, **Mozilla Firefox**, and **Brave** on Windows.
- When clicking **"Pin Over VS Code"** or **"Keep on Screen (PiP)"**:
  - Windows places the video player into an Always-On-Top OS window layer (`WS_EX_TOPMOST`).
  - The video or live countdown HUD floats seamlessly over VS Code, Windows Terminal, PowerShell, File Explorer, and any other desktop window.
  - Can be resized or repositioned to any corner of the monitor.
- **Canvas Fallback Streaming**: Just like on Linux, if the organizer hasn't placed local MP4 files yet, the Cyberpunk Canvas animation streams dynamically into the PiP player with a live countdown timer.

### Layer 2: Windows Action Center / Notification Center Toasts
- The browser dispatches alerts through the Windows Notification system.
- When an incoming sabotage strikes while VS Code is active, a native Windows toast notification slides in from the bottom-right corner of the taskbar with sound.
- With `requireInteraction: true`, the notification stays on screen until dismissed.
- Clicking the notification immediately focuses the browser tab.

### Layer 3: Windows WASAPI / DirectSound Web Audio Siren
- Emergency alarm siren tones synthesize via the Web Audio API and output directly to headphones/speakers via the Windows Audio service.
- Plays audibly even when the browser is minimized to the taskbar.
- The browser tab flashes `🚨 SABOTAGE HIT! 🚨` on the Windows Taskbar icon.

### Layer 4: Tactical Windows Desktop Companion Agent (`run_agent.bat`)
For Windows laptops/desktops requiring a forced OS takeover directly over VS Code:
1. Double click `run_agent.bat` or run from PowerShell / CMD:
   ```cmd
   run_agent.bat <TEAM_ID> [SERVER_IP:8000]
   ```
   *Example for Team 1 connecting to `localhost:8000`:*
   ```cmd
   run_agent.bat 1
   ```
2. What happens on Windows when sabotage or shield triggers:
   - **Topmost Tkinter Overlay**: A cyberpunk HUD alert pops up in the top-right corner directly over VS Code with live countdown and a dismiss button.
   - **Windows System Notification**: Fires a Windows balloon/toast alert.
   - **Windows System Audio**: Plays urgent beeps via `winsound.Beep` and `winsound.MessageBeep`.
   - **Browser Auto-Focus**: Restores and activates the Chrome/Edge arena window over VS Code via `WScript.Shell.AppActivate`.
   - **Local Video Launch**: If `mpv` or `vlc` is installed, launches with `--ontop`; otherwise triggers default Windows media player via `os.startfile`.

---

## 7. Verification & Step-by-Step Testing Flow (Cross-Platform)

To test the entire video and multi-window alert flow on either Linux or Windows:

1. **Start the Backend**:
   ```bash
   uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
   ```

2. **Start the Frontend**:
   ```bash
   cd frontend
   npm run dev -- --host 0.0.0.0 --port 5173
   ```

3. **Simulate Squad Actions**:
   - **Step A (Power-Up / Shield Activation)**:
     - Open Team 1 terminal in the browser (`/player`). Navigate to *Power-up Pothys*.
     - Activate *Defensive Shield* or *Reflective Shield*.
     - Observe: Squad balance deduction, celebratory tone, and *Shield Active* video HUD modal opening. Click "Pin Over VS Code" to test PiP.
   - **Step B (Sabotage Deployment & Interception)**:
     - Open Team 2 terminal in a separate window or incognito session.
     - Deploy *Blackout* targeting Team 1.
     - If Team 1 has *Defensive Shield*: Both squads receive `SABOTAGE_BLOCKED`. Team 1 sees *Shield Defense Absorbed* video. Team 2 sees *Attack Blocked* alert.
     - If Team 1 has *Reflective Shield*: Both squads receive `SABOTAGE_REFLECTED`. Team 1 sees *Counter-Strike Deflected* video. Team 2 receives their own sabotage with full video alert & countdown!
     - If Team 1 has *No Shield*: Team 1 receives `SABOTAGE_DEPLOYED`. Video alert modal opens, siren alarm plays, tab title flashes, and OS desktop notification fires.
   - **Step C (External VS Code Alert Test)**:
     - Minimize the browser or switch focus entirely into VS Code.
     - Trigger a sabotage on that team.
     - Verify:
       1. Native desktop notification toast pops up in corner (Windows Action Center or Linux Dunst/GNOME).
       2. Web Audio / winsound alarm sounds loudly through speakers.
       3. If Picture-in-Picture was active, the video continues playing always-on-top over VS Code.
       4. If `run_agent.sh` (Linux) or `run_agent.bat` (Windows) is running, the topmost Tkinter Cyber HUD alert floats over VS Code with live countdown timer!

