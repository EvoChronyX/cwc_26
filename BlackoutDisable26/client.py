import ctypes
import os
import platform
import socket
import subprocess
import threading
import time
import tkinter as tk

import socketio
from dotenv import load_dotenv


# ============================================================
# CONFIGURATION
# ============================================================

load_dotenv()

SERVER_IP = os.getenv("SERVER_IP")

SERVER_PORT = int(
    os.getenv(
        "SERVER_PORT",
        "3000"
    )
)

if not SERVER_IP:
    raise RuntimeError(
        "SERVER_IP is missing from .env"
    )

SERVER_URL = (
    f"http://{SERVER_IP}:{SERVER_PORT}"
)


# ============================================================
# GLOBAL STATE
# ============================================================

sio = socketio.Client(
    reconnection=True,
    reconnection_attempts=0
)

blackout_active = False
blackout_end_time = 0

input_lock_active = False

overlay = None
overlay_label = None

stop_event = threading.Event()

team_name = ""


# ============================================================
# PLATFORM
# ============================================================

IS_WINDOWS = (
    platform.system() == "Windows"
)

IS_LINUX = (
    platform.system() == "Linux"
)


# ============================================================
# HOSTNAME
# ============================================================

hostname = socket.gethostname()


# ============================================================
# TEAM NAME PROMPT
# ============================================================

def prompt_team_name():

    global team_name

    while True:

        entered = input(
            "Enter your team name: "
        ).strip()

        if entered:
            team_name = entered
            return

        print(
            "Team name cannot be empty."
        )


# ============================================================
# TKINTER OVERLAY
# ============================================================

def create_overlay():

    global overlay
    global overlay_label

    overlay = tk.Tk()

    overlay.title("Participant")

    overlay.configure(
        bg="#111111"
    )

    overlay.attributes(
        "-fullscreen",
        True
    )

    overlay.attributes(
        "-topmost",
        True
    )

    overlay.protocol(
        "WM_DELETE_WINDOW",
        lambda: None
    )


    container = tk.Frame(
        overlay,
        bg="#111111"
    )

    container.pack(
        expand=True,
        fill="both"
    )


    title = tk.Label(
        container,
        text="Please wait",
        font=("Arial", 32, "bold"),
        fg="white",
        bg="#111111"
    )

    title.pack(
        pady=(0, 25)
    )


    overlay_label = tk.Label(
        container,
        text="Blackout",
        font=("Arial", 22),
        fg="#dddddd",
        bg="#111111"
    )

    overlay_label.pack()


    overlay.withdraw()

    overlay.mainloop()


# ============================================================
# BLACKOUT
# ============================================================

def show_blackout(duration_ms):

    global blackout_active
    global blackout_end_time

    blackout_active = True

    blackout_end_time = (
        time.time() +
        duration_ms / 1000
    )


    if overlay is None:
        return


    try:

        overlay.deiconify()

        overlay.attributes(
            "-topmost",
            True
        )

        overlay.lift()

        overlay.focus_force()

        update_blackout_label()

    except tk.TclError:
        pass


def hide_blackout():

    global blackout_active
    global blackout_end_time

    blackout_active = False

    blackout_end_time = 0


    if overlay is None:
        return


    try:
        overlay.withdraw()

    except tk.TclError:
        pass


def update_blackout_label():

    if not blackout_active:
        return


    remaining = (
        blackout_end_time -
        time.time()
    )


    if remaining <= 0:

        hide_blackout()

        return


    total_seconds = int(
        remaining
    )


    minutes = (
        total_seconds // 60
    )

    seconds = (
        total_seconds % 60
    )


    text = (
        f"Blackout • Ends in "
        f"{minutes}m {seconds:02d}s"
    )


    try:

        overlay_label.config(
            text=text
        )

        overlay.after(
            250,
            update_blackout_label
        )

    except tk.TclError:
        pass


# ============================================================
# WINDOWS CLIPBOARD
# ============================================================
#
# NOTE: A low-level Windows keyboard hook (blocking Ctrl+C/V/X,
# Shift/Ctrl+Insert, Space) used to live here. It was removed:
# clipboard/input lock is already enforced by continuously
# wiping the clipboard below, the hook duplicated that
# protection, it only ever worked on Windows, and it relied on
# `ctypes.wintypes` without importing that submodule (it isn't
# pulled in by a bare `import ctypes`), so it would have raised
# an AttributeError the first time it ran. If you need to block
# keystrokes at the OS level again, re-add it deliberately and
# `import ctypes.wintypes` explicitly.

if IS_WINDOWS:

    user32 = ctypes.windll.user32


def clear_windows_clipboard():

    try:

        user32.OpenClipboard(
            None
        )

        try:

            user32.EmptyClipboard()

        finally:

            user32.CloseClipboard()

    except Exception:
        pass


def windows_clipboard_thread():

    while not stop_event.is_set():

        if input_lock_active:

            clear_windows_clipboard()

        time.sleep(0.15)


# ============================================================
# LINUX
# ============================================================

linux_session = ""

if IS_LINUX:

    linux_session = os.environ.get(
        "XDG_SESSION_TYPE",
        ""
    ).lower()


    print(
        "Linux session type:",
        linux_session or "unknown"
    )


# ============================================================
# LINUX CLIPBOARD
# ============================================================

def linux_clear_clipboard():

    if linux_session == "wayland":

        try:

            subprocess.run(
                [
                    "wl-copy",
                    "--clear"
                ],

                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL,

                timeout=1
            )

        except Exception:
            pass


    elif linux_session == "x11":

        try:

            subprocess.run(
                [
                    "xclip",
                    "-selection",
                    "clipboard",
                    "/dev/null"
                ],

                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL,

                timeout=1
            )

        except Exception:
            pass


def linux_clipboard_thread():

    while not stop_event.is_set():

        if input_lock_active:

            linux_clear_clipboard()

        time.sleep(0.15)


# ============================================================
# INPUT LOCK
# ============================================================

def enable_input_lock():

    global input_lock_active

    input_lock_active = True

    print(
        "Clipboard / input lock ENABLED"
    )


def disable_input_lock():

    global input_lock_active

    input_lock_active = False

    print(
        "Clipboard / input lock DISABLED"
    )


# ============================================================
# SOCKET EVENTS
# ============================================================

@sio.event
def connect():

    print(
        "Connected to:",
        SERVER_URL
    )


    sio.emit(
        "register_client",
        {
            "username": team_name,
            "hostname": hostname
        }
    )


@sio.event
def disconnect():

    print(
        "Disconnected from server."
    )


@sio.on("your_id")
def on_your_id(client_id):

    print(
        "Assigned socket ID:",
        client_id
    )


@sio.on("blackout")
def on_blackout(duration):

    try:

        duration = int(duration)

    except (
        TypeError,
        ValueError
    ):

        return


    print(
        f"Blackout received: {duration}ms"
    )


    if overlay is not None:

        overlay.after(
            0,
            lambda: show_blackout(
                duration
            )
        )


@sio.on("endBlackout")
def on_end_blackout():

    print(
        "Blackout ended by admin."
    )


    if overlay is not None:

        overlay.after(
            0,
            hide_blackout
        )


@sio.on("clipboardLock")
def on_clipboard_lock(enabled):

    if enabled:

        enable_input_lock()

    else:

        disable_input_lock()


# ============================================================
# SERVER CONNECTION
# ============================================================

def connect_to_server():

    while not stop_event.is_set():

        try:

            sio.connect(
                SERVER_URL,
                wait_timeout=5
            )

            return

        except Exception as exc:

            print(
                f"Could not connect to server: {exc}"
            )

            time.sleep(3)


# ============================================================
# MAIN
# ============================================================

def main():

    print(
        "================================"
    )

    print(
        "Participant Client"
    )

    print(
        "================================"
    )

    prompt_team_name()

    print(
        f"Team: {team_name}"
    )

    print(
        f"Server: {SERVER_URL}"
    )

    print(
        f"Platform: {platform.system()}"
    )


    if IS_LINUX:

        print(
            f"Session: "
            f"{linux_session or 'unknown'}"
        )


    # --------------------------------------------------------
    # Tkinter
    # --------------------------------------------------------

    overlay_thread = threading.Thread(
        target=create_overlay,
        daemon=True
    )

    overlay_thread.start()


    # --------------------------------------------------------
    # Windows
    # --------------------------------------------------------

    if IS_WINDOWS:

        threading.Thread(
            target=windows_clipboard_thread,
            daemon=True
        ).start()


    # --------------------------------------------------------
    # Linux
    # --------------------------------------------------------

    elif IS_LINUX:

        threading.Thread(
            target=linux_clipboard_thread,
            daemon=True
        ).start()


    # --------------------------------------------------------
    # Socket.IO
    # --------------------------------------------------------

    connect_to_server()


    try:

        while True:

            time.sleep(1)

    except KeyboardInterrupt:

        print(
            "Stopping participant client..."
        )

        stop_event.set()


        try:

            sio.disconnect()

        except Exception:

            pass


if __name__ == "__main__":

    main()