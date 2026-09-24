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
# OPTIONAL X11 IMPORT
# ============================================================

X11_AVAILABLE = False

if platform.system() == "Linux":

    try:
        from Xlib import X
        from Xlib import XK
        from Xlib.display import Display

        X11_AVAILABLE = True

    except ImportError:

        print(
            "WARNING: python-xlib is not installed."
        )

        print(
            "Install it with:"
        )

        print(
            "python3 -m pip install python-xlib"
        )


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

    SERVER_IP = "10.106.113.124"

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

x11_thread = None


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

    overlay.title(
        "Participant"
    )

    overlay.configure(
        bg="#111111"
    )

    # --------------------------------------------------------
    # VISUAL-ONLY overlay.
    #
    # overrideredirect(True) makes this an unmanaged window:
    # the window manager will NOT give it keyboard focus, so
    # whatever app is behind it (terminal / editor) keeps focus
    # and the participant can keep typing. This is the key to
    # why last year's blackout worked. Do NOT use -fullscreen
    # (that's a managed, focus-taking mode) and never call
    # focus_force() / grab_set_global() on this window.
    # --------------------------------------------------------

    overlay.overrideredirect(True)

    overlay.attributes(
        "-topmost",
        True
    )

    # Linux/X11: hint that this is a dock/overlay window so the
    # WM treats it as non-focusable chrome.
    if IS_LINUX:
        try:
            overlay.wm_attributes("-type", "dock")
        except Exception:
            pass

    # Size to the whole screen manually (override-redirect windows
    # are not auto-sized by the WM).
    sw = overlay.winfo_screenwidth()
    sh = overlay.winfo_screenheight()
    overlay.geometry(f"{sw}x{sh}+0+0")

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
# WINDOWS OVERLAY CLICK-THROUGH
# ============================================================
#
# Makes the overlay non-activating and click-through on Windows,
# so it never steals focus and input passes to the app behind it.
# (Clients are Ubuntu/X11, but kept for the Windows case.)

if IS_WINDOWS:

    _u32 = ctypes.windll.user32

    GWL_EXSTYLE = -20

    WS_EX_LAYERED = 0x00080000
    WS_EX_TRANSPARENT = 0x00000020
    WS_EX_TOOLWINDOW = 0x00000080
    WS_EX_NOACTIVATE = 0x08000000

    LWA_ALPHA = 0x02
    HWND_TOPMOST = -1

    SWP_NOMOVE = 0x2
    SWP_NOSIZE = 0x1
    SWP_NOACTIVATE = 0x10
    SWP_SHOWWINDOW = 0x40

    def win_apply_clickthrough(hwnd):

        ex = _u32.GetWindowLongW(
            hwnd,
            GWL_EXSTYLE
        )

        ex |= (
            WS_EX_LAYERED
            | WS_EX_TRANSPARENT
            | WS_EX_TOOLWINDOW
            | WS_EX_NOACTIVATE
        )

        _u32.SetWindowLongW(
            hwnd,
            GWL_EXSTYLE,
            ex
        )

        _u32.SetLayeredWindowAttributes(
            hwnd,
            0,
            255,
            LWA_ALPHA
        )

        _u32.SetWindowPos(
            hwnd,
            HWND_TOPMOST,
            0,
            0,
            0,
            0,
            SWP_NOMOVE
            | SWP_NOSIZE
            | SWP_NOACTIVATE
            | SWP_SHOWWINDOW
        )


# ============================================================
# BLACKOUT
# ============================================================

def show_blackout(duration_ms):

    global blackout_active
    global blackout_end_time

    blackout_active = True

    blackout_end_time = (
        time.time()
        + duration_ms / 1000
    )

    if overlay is None:
        return

    try:

        # Re-assert full-screen geometry each time.
        sw = overlay.winfo_screenwidth()
        sh = overlay.winfo_screenheight()
        overlay.geometry(f"{sw}x{sh}+0+0")

        overlay.deiconify()

        overlay.attributes(
            "-topmost",
            True
        )

        overlay.lift()

        # --------------------------------------------------------
        # VISUAL ONLY: no focus_force(), no grab. Keystrokes must
        # keep reaching the app behind the overlay.
        # --------------------------------------------------------
        if IS_WINDOWS:
            win_apply_clickthrough(
                overlay.winfo_id()
            )

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
        blackout_end_time
        - time.time()
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

if IS_WINDOWS:

    user32 = ctypes.windll.user32


def clear_windows_clipboard():

    if not IS_WINDOWS:
        return

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

        time.sleep(
            0.15
        )


# ============================================================
# LINUX SESSION
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

    if not IS_LINUX:
        return

    if linux_session != "x11":
        return

    try:

        subprocess.run(
            [
                "xclip",
                "-selection",
                "clipboard",
                "-i"
            ],
            input=b"",
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

        time.sleep(
            0.05
        )


# ============================================================
# X11 KEY HELPERS
# ============================================================

def x11_get_keycode(
    display,
    key_name
):

    keysym = XK.string_to_keysym(
        key_name
    )

    if keysym == 0:

        return 0

    return display.keysym_to_keycode(
        keysym
    )


def x11_modifier_variants(
    modifier
):

    # Normal
    # CapsLock
    # NumLock
    # CapsLock + NumLock

    return [

        modifier,

        modifier | X.LockMask,

        modifier | X.Mod2Mask,

        modifier | X.LockMask | X.Mod2Mask

    ]


def x11_grab_key(
    display,
    root,
    key_name,
    modifier
):

    keycode = x11_get_keycode(
        display,
        key_name
    )

    if keycode == 0:

        print(
            f"WARNING: could not find "
            f"X11 key: {key_name}"
        )

        return

    for mod in x11_modifier_variants(
        modifier
    ):

        try:

            root.grab_key(
                keycode,
                mod,
                True,
                X.GrabModeAsync,
                X.GrabModeAsync
            )

        except Exception as exc:

            print(
                f"Could not grab "
                f"{key_name}: {exc}"
            )


def x11_ungrab_key(
    display,
    root,
    key_name,
    modifier
):

    keycode = x11_get_keycode(
        display,
        key_name
    )

    if keycode == 0:
        return

    for mod in x11_modifier_variants(
        modifier
    ):

        try:

            root.ungrab_key(
                keycode,
                mod
            )

        except Exception:

            pass


# ============================================================
# X11 KEYBOARD LOCK
# ============================================================

def x11_enable_keyboard_lock(
    display,
    root
):

    # Ctrl+C

    x11_grab_key(
        display,
        root,
        "c",
        X.ControlMask
    )

    # Ctrl+V

    x11_grab_key(
        display,
        root,
        "v",
        X.ControlMask
    )

    # Ctrl+X

    x11_grab_key(
        display,
        root,
        "x",
        X.ControlMask
    )

    # Ctrl+Insert

    x11_grab_key(
        display,
        root,
        "Insert",
        X.ControlMask
    )

    # Shift+Insert

    x11_grab_key(
        display,
        root,
        "Insert",
        X.ShiftMask
    )

    # Ctrl+Shift+C

    x11_grab_key(
        display,
        root,
        "c",
        X.ControlMask | X.ShiftMask
    )

    # Ctrl+Shift+V

    x11_grab_key(
        display,
        root,
        "v",
        X.ControlMask | X.ShiftMask
    )

    display.flush()

    print(
        "X11 keyboard copy/paste LOCKED"
    )


def x11_disable_keyboard_lock(
    display,
    root
):

    # Ctrl+C

    x11_ungrab_key(
        display,
        root,
        "c",
        X.ControlMask
    )

    # Ctrl+V

    x11_ungrab_key(
        display,
        root,
        "v",
        X.ControlMask
    )

    # Ctrl+X

    x11_ungrab_key(
        display,
        root,
        "x",
        X.ControlMask
    )

    # Ctrl+Insert

    x11_ungrab_key(
        display,
        root,
        "Insert",
        X.ControlMask
    )

    # Shift+Insert

    x11_ungrab_key(
        display,
        root,
        "Insert",
        X.ShiftMask
    )

    # Ctrl+Shift+C

    x11_ungrab_key(
        display,
        root,
        "c",
        X.ControlMask | X.ShiftMask
    )

    # Ctrl+Shift+V

    x11_ungrab_key(
        display,
        root,
        "v",
        X.ControlMask | X.ShiftMask
    )

    display.flush()

    print(
        "X11 keyboard copy/paste UNLOCKED"
    )


# ============================================================
# X11 MOUSE LOCK
# ============================================================

def x11_enable_mouse_lock(
    display,
    root
):

    # --------------------------------------------------------
    # Button 2 = middle click
    # Button 3 = right click
    # --------------------------------------------------------

    for button in (2, 3):

        try:

            root.grab_button(
                button,
                X.AnyModifier,
                False,
                X.ButtonPressMask,
                X.GrabModeAsync,
                X.GrabModeAsync,
                X.NONE,
                X.NONE
            )

        except Exception as exc:

            print(
                f"Could not grab "
                f"mouse button {button}: {exc}"
            )

    display.flush()

    print(
        "X11 mouse copy/paste LOCKED"
    )


def x11_disable_mouse_lock(
    display,
    root
):

    for button in (2, 3):

        try:

            root.ungrab_button(
                button,
                X.AnyModifier
            )

        except Exception:

            pass

    display.flush()

    print(
        "X11 mouse copy/paste UNLOCKED"
    )


# ============================================================
# X11 LOCK THREAD
# ============================================================

def x11_keyboard_lock_loop():

    if not IS_LINUX:
        return

    if linux_session != "x11":

        print(
            "Linux session is not X11."
        )

        return

    if not X11_AVAILABLE:

        print(
            "python-xlib is unavailable."
        )

        return

    display = None

    try:

        display = Display()

        root = display.screen().root

        lock_state = False

        print(
            "X11 input lock thread started."
        )

        while not stop_event.is_set():

            # =================================================
            # LOCK
            # =================================================

            if (
                input_lock_active
                and not lock_state
            ):

                x11_enable_keyboard_lock(
                    display,
                    root
                )

                x11_enable_mouse_lock(
                    display,
                    root
                )

                lock_state = True

                print(
                    "X11 FULL COPY/PASTE LOCK ENABLED"
                )

            # =================================================
            # UNLOCK
            # =================================================

            elif (
                not input_lock_active
                and lock_state
            ):

                x11_disable_keyboard_lock(
                    display,
                    root
                )

                x11_disable_mouse_lock(
                    display,
                    root
                )

                lock_state = False

                print(
                    "X11 FULL COPY/PASTE LOCK DISABLED"
                )

            # =================================================
            # PROCESS GRABBED EVENTS
            # =================================================

            while display.pending_events():

                try:

                    display.next_event()

                except Exception:

                    break

            time.sleep(
                0.01
            )

        # =====================================================
        # CLEANUP
        # =====================================================

        if lock_state:

            x11_disable_keyboard_lock(
                display,
                root
            )

            x11_disable_mouse_lock(
                display,
                root
            )

    except Exception as exc:

        print(
            "X11 input lock error:",
            exc
        )

    finally:

        if display is not None:

            try:

                display.close()

            except Exception:

                pass

        print(
            "X11 input lock thread stopped."
        )


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

        duration = int(
            duration
        )

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

            time.sleep(
                3
            )


# ============================================================
# MAIN
# ============================================================

def main():

    global x11_thread

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

        print(
            "X11 support:",
            "available"
            if X11_AVAILABLE
            else "unavailable"
        )

    # ========================================================
    # TKINTER
    # ========================================================

    overlay_thread = threading.Thread(
        target=create_overlay,
        daemon=True
    )

    overlay_thread.start()

    # ========================================================
    # WINDOWS
    # ========================================================

    if IS_WINDOWS:

        threading.Thread(
            target=windows_clipboard_thread,
            daemon=True
        ).start()

    # ========================================================
    # LINUX
    # ========================================================

    elif IS_LINUX:

        # Clipboard clearing

        threading.Thread(
            target=linux_clipboard_thread,
            daemon=True
        ).start()

        # X11 keyboard + mouse grabs

        if (
            linux_session == "x11"
            and X11_AVAILABLE
        ):

            x11_thread = threading.Thread(
                target=x11_keyboard_lock_loop,
                daemon=True
            )

            x11_thread.start()

        else:

            print(
                "X11 input locking is unavailable."
            )

    # ========================================================
    # SOCKET.IO
    # ========================================================

    connect_to_server()

    try:

        while True:

            time.sleep(
                1
            )

    except KeyboardInterrupt:

        print(
            "Stopping participant client..."
        )

        stop_event.set()

        disable_input_lock()

        try:

            sio.disconnect()

        except Exception:

            pass


# ============================================================
# ENTRY POINT
# ============================================================

if __name__ == "__main__":

    main()
