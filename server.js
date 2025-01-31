/* dependencies - imports
------------------------------- */
import express from "express";
import http from "http";
import cors from 'cors'
import { WebSocketServer } from "ws";
import { nanoid } from 'nanoid';



/* application variables
------------------------------- */
const IP = "localhost";
const PORT = 8888;
let playersOnline = [];
const colors = ["yellow", "green", "blue", "red"];



/* express
------------------------------- */
// express 'app' environment
const app = express();

app.use(cors());
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());



/* express routes
------------------------------- */
app.get('/api/id', (req, res) => {
    const color = colors.length > 0 ? colors.pop() : "transparent";
    res.json({ id: nanoid(), color: color });
});



/* server(s)
------------------------------- */
// use core module http and pass express as an instance
const server = http.createServer(app);

// create WebSocket server - use a predefined server
const wss = new WebSocketServer({ noServer: true });

/* allow websockets - listener
------------------------------- */
// upgrade event - websocket communication
server.on("upgrade", (req, socket, head) => {

    // use authentication - only logged in users allowed ?
    // return;

    // start websocket
    wss.handleUpgrade(req, socket, head, (ws) => {
        console.log("let user use websocket...");

        wss.emit("connection", ws, req);
    });
});



/* listen on new websocket connections
------------------------------- */
wss.on("connection", (ws) => {
    console.log("New client connection from IP: ", ws._socket.remoteAddress);
    console.log("Number of connected clients: ", wss.clients.size);

    // send players online
    ws.send(JSON.stringify({ type: "online", playersOnline: playersOnline }));


    // events (ws) for single client

    // close event
    ws.on("close", () => {
        console.log("Client disconnected, remaining clients: ", wss.clients.size);

        let obj = { type: "offline" };
        let playerOffline;

        // remove offline player in 'server land'
        if (Array.isArray(playersOnline)) {
            for (let i = playersOnline.length - 1; i >= 0; i--) {
                if (playersOnline[i].ws === ws) {
                    playerOffline = playersOnline.splice(i, 1);
                }
            }
        }

        if (playerOffline) {
            obj.playerOffline = playerOffline[0];
        }

        broadcastExclude(wss, ws, obj);
    });

    // message event
    ws.on("message", (data) => {

        let obj = JSON.parse(data);

        switch (obj.type) {

            case "newplayer":

                // add player in 'server land'
                playersOnline.push({ ws: ws, player: obj.player });
                broadcastExclude(wss, ws, { type: "newplayer", player: obj.player });

                break;

            case "draw":

                broadcastExclude(wss, ws, obj);
                break;

            default:
                break;
        }
    });
});


/**
 * broadcast to clients
 *
 * @param {WebSocketServer} wss
 * @param {obj} obj
 */
function broadcast(wss, obj) {

    // broadcast to all clients
    wss.clients.forEach((client) => {
        client.send(JSON.stringify(obj));
    });
}

/**
 * broadcast to clients, but not itself
 *
 * @param {WebSocketServer} wss
 * @param {obj} wsExclude
 * @param {obj} obj
 */
function broadcastExclude(wss, wsExclude, obj) {

    // broadcast to all clients but one
    wss.clients.forEach((client) => {
        if (client !== wsExclude) {
            client.send(JSON.stringify(obj));
        }
    });
}


/* listen on initial connection
------------------------------- */
server.listen(PORT, IP, (req, res) => {
    console.log(`Express server running on ip ${IP} port ${PORT}`);
});