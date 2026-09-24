// ============================================================
// SERVER.JS
// ============================================================

require("dotenv").config();

const express = require("express");
const http = require("http");
const socketio = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketio(server);


// ============================================================
// ENVIRONMENT
// ============================================================

const PORT = Number(process.env.PORT || 3000);

const SERVER_IP =
    process.env.SERVER_IP || "0.0.0.0";

const ADMIN_PASSWORD =
    process.env.ADMIN_PASSWORD;

if (!ADMIN_PASSWORD) {
    console.error(
        "ERROR: ADMIN_PASSWORD is missing from .env"
    );

    process.exit(1);
}


// ============================================================
// STATIC FILES
// ============================================================

app.use(
    express.static("public")
);


// ============================================================
// CONNECTED PARTICIPANTS
// ============================================================

let clients = [];


// ============================================================
// HELPERS
// ============================================================

function isAdmin(socket) {

    return socket.isAdmin === true;

}


function validPlayers(players) {

    return (
        Array.isArray(players) &&
        players.length > 0
    );

}


function sendToSelected(
    players,
    event,
    data
) {

    if (!validPlayers(players)) {
        return;
    }


    for (
        const [id, socket]
        of io.sockets.sockets
    ) {

        if (
            players.includes(
                socket.clientInfo?.id
            )
        ) {

            socket.emit(
                event,
                data
            );

        }

    }

}


// ============================================================
// CONNECTION
// ============================================================

io.on(
    "connection",
    (socket) => {

        console.log(
            "New connection:",
            socket.id
        );


        // ====================================================
        // PARTICIPANT REGISTRATION
        // ====================================================

        socket.on(
            "register_client",
            ({ username, hostname }) => {

                const name =
                    username &&
                    username.trim() !== ""
                        ? username.trim()
                        : "Anonymous";


                const clientInfo = {

                    id: socket.id,

                    username: name,

                    hostname:
                        hostname ||
                        "Unknown",

                    ip:
                        socket.handshake.address
                            .replace(
                                "::ffff:",
                                ""
                            )

                };


                socket.clientInfo =
                    clientInfo;


                clients.push(
                    clientInfo
                );


                console.log(
                    `Client connected: ${name} - ` +
                    `${clientInfo.hostname} - ` +
                    `${clientInfo.ip}`
                );


                socket.emit(
                    "your_id",
                    socket.id
                );


                io.emit(
                    "update_players",
                    clients
                );

            }
        );


        // ====================================================
        // ADMIN LOGIN
        // ====================================================

        socket.on(
            "register_admin",
            (password) => {

                if (
                    password !==
                    ADMIN_PASSWORD
                ) {

                    console.log(
                        "Rejected admin login:",
                        socket.id
                    );


                    socket.emit(
                        "admin_auth_result",
                        {
                            success: false,
                            message:
                                "Invalid admin password."
                        }
                    );


                    return;

                }


                socket.isAdmin = true;


                console.log(
                    "Admin authenticated:",
                    socket.id
                );


                socket.emit(
                    "admin_auth_result",
                    {
                        success: true,
                        message:
                            "Admin authenticated."
                    }
                );


                socket.emit(
                    "update_players",
                    clients
                );

            }
        );


        // ====================================================
        // BLACKOUT ALL
        // ====================================================

        socket.on(
            "blackoutAll",
            (duration) => {

                if (!isAdmin(socket)) {
                    return;
                }


                const ms =
                    Number(duration);


                if (
                    !Number.isFinite(ms) ||
                    ms <= 0
                ) {

                    return;

                }


                console.log(
                    `Blackout ALL: ${ms}ms`
                );


                for (
                    const [id, clientSocket]
                    of io.sockets.sockets
                ) {

                    if (
                        clientSocket.clientInfo
                    ) {

                        clientSocket.emit(
                            "blackout",
                            ms
                        );

                    }

                }

            }
        );


        // ====================================================
        // END BLACKOUT ALL
        // ====================================================

        socket.on(
            "endBlackoutAll",
            () => {

                if (!isAdmin(socket)) {
                    return;
                }


                console.log(
                    "End blackout ALL"
                );


                for (
                    const [id, clientSocket]
                    of io.sockets.sockets
                ) {

                    if (
                        clientSocket.clientInfo
                    ) {

                        clientSocket.emit(
                            "endBlackout"
                        );

                    }

                }

            }
        );


        // ====================================================
        // BLACKOUT SELECTED
        // ====================================================

        socket.on(
            "selectiveBlackout",
            ({ players, duration }) => {

                if (!isAdmin(socket)) {
                    return;
                }


                const ms =
                    Number(duration);


                if (
                    !validPlayers(players) ||
                    !Number.isFinite(ms) ||
                    ms <= 0
                ) {

                    return;

                }


                console.log(
                    "Blackout selected:",
                    players
                );


                sendToSelected(
                    players,
                    "blackout",
                    ms
                );

            }
        );


        // ====================================================
        // END BLACKOUT SELECTED
        // ====================================================

        socket.on(
            "selectiveEndBlackout",
            ({ players }) => {

                if (!isAdmin(socket)) {
                    return;
                }


                if (!validPlayers(players)) {
                    return;
                }


                console.log(
                    "End blackout selected:",
                    players
                );


                sendToSelected(
                    players,
                    "endBlackout"
                );

            }
        );


        // ====================================================
        // CLIPBOARD / INPUT LOCK ALL
        // ====================================================

        socket.on(
            "clipboardLockAll",
            () => {

                if (!isAdmin(socket)) {
                    return;
                }


                console.log(
                    "Clipboard/input LOCK -> ALL"
                );


                for (
                    const [id, clientSocket]
                    of io.sockets.sockets
                ) {

                    if (
                        clientSocket.clientInfo
                    ) {

                        clientSocket.emit(
                            "clipboardLock",
                            true
                        );

                    }

                }

            }
        );


        // ====================================================
        // CLIPBOARD / INPUT UNLOCK ALL
        // ====================================================

        socket.on(
            "clipboardUnlockAll",
            () => {

                if (!isAdmin(socket)) {
                    return;
                }


                console.log(
                    "Clipboard/input UNLOCK -> ALL"
                );


                for (
                    const [id, clientSocket]
                    of io.sockets.sockets
                ) {

                    if (
                        clientSocket.clientInfo
                    ) {

                        clientSocket.emit(
                            "clipboardLock",
                            false
                        );

                    }

                }

            }
        );


        // ====================================================
        // CLIPBOARD / INPUT LOCK SELECTED
        // ====================================================

        socket.on(
            "selectiveClipboardLock",
            ({ players }) => {

                if (!isAdmin(socket)) {
                    return;
                }


                if (!validPlayers(players)) {
                    return;
                }


                console.log(
                    "Clipboard/input LOCK ->",
                    players
                );


                sendToSelected(
                    players,
                    "clipboardLock",
                    true
                );

            }
        );


        // ====================================================
        // CLIPBOARD / INPUT UNLOCK SELECTED
        // ====================================================

        socket.on(
            "selectiveClipboardUnlock",
            ({ players }) => {

                if (!isAdmin(socket)) {
                    return;
                }


                if (!validPlayers(players)) {
                    return;
                }


                console.log(
                    "Clipboard/input UNLOCK ->",
                    players
                );


                sendToSelected(
                    players,
                    "clipboardLock",
                    false
                );

            }
        );


        // ====================================================
        // DISCONNECT
        // ====================================================

        socket.on(
            "disconnect",
            () => {

                console.log(
                    "Disconnected:",
                    socket.id
                );


                clients =
                    clients.filter(
                        (client) =>
                            client.id !==
                            socket.id
                    );


                io.emit(
                    "update_players",
                    clients
                );

            }
        );

    }
);


// ============================================================
// START SERVER
// ============================================================

server.listen(
    PORT,
    "0.0.0.0",
    () => {

        console.log(
            `Server running on http://${SERVER_IP}:${PORT}`
        );

    }
);
