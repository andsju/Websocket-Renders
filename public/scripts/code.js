/* DOM elements
------------------------------- */
const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");
const form = document.querySelector("form");



/* dependencies
------------------------------- */
import Player from "./Player.js";



/* variables
------------------------------- */
const IP = "localhost";
const websocket = new WebSocket(`ws://${IP}:8888`);
const fps = 60;
const players = [];
let player;
let startDraw = false;
let points = [];
const pointsSize = 30;


// default
// gameLoop();



/* events
------------------------------- */
form.addEventListener("submit", (e) => {
    e.preventDefault();
    const elementUsername = form.querySelector("#username");
    const username = elementUsername.value;
    elementUsername.setAttribute("disabled", true);
    form.querySelector("#setPlayer").setAttribute("disabled", true);


    // request id using api call
    fetch(`http://${IP}:8888/api/id`)
        .then(res => res.json())
        .then((obj) => {
            player = new Player(obj.id, username, obj.color);
            players.push(player);
            console.log("player", player);
            websocket.send(JSON.stringify({type: "newplayer", player: player}))
        });
});



/* websocket events
------------------------------- */
websocket.addEventListener("open", () => {
    console.log("Connection open");
});



websocket.addEventListener("close", (e) => {
    console.log("Socket closed");
});



websocket.addEventListener("message", (e) => {

    let obj = JSON.parse(e.data);

    switch (obj.type) {

        case "newplayer":

            // add websocket player in 'browser land'
            const socketPlayer = new Player(obj.player.id, obj.player.username, obj.player.color);
            players.push(socketPlayer);

            break;

        case "online":

            // add websocket players in 'browser land'
            if (Array.isArray(obj.playersOnline)) {
                obj.playersOnline.forEach(playerOnline => {
                    const socketPlayer = new Player(playerOnline.player.id, playerOnline.player.username, playerOnline.player.color);
                    players.push(socketPlayer);
                });
            }

            break;

        case "draw":

            // draw buffered 
            obj.points.forEach(point => {
                if (point.mouse === "mousedown") {
                    ctx.beginPath();
                    ctx.moveTo(point.x, point.y);
                    ctx.strokeStyle = obj.player.color;
                    ctx.lineWidth = 3;
                    ctx.lineCap = "round";
                    ctx.lineJoin = "round";
                    ctx.shadowColor = "white";
                    ctx.shadowBlur = 1;

                } else if (point.mouse === "mousemove") {
                    ctx.lineTo(point.x, point.y);
                    ctx.stroke();
                }
            });

            break;

        case "offline":

            // remove offline player in 'browser land'
            if (obj.hasOwnProperty("playerOffline")) {
                if (Array.isArray(players)) {
                    for (let i = players.length - 1; i >= 0; i--) {
                        if (obj.playerOffline.player.id === players[i].id) {
                            players.splice(i, 1);
                        }
                    }
                }
            }
            break;

        default:
            console.log("message to handle...", obj.type);
            break;
    }
});


canvas.addEventListener("mousedown", (e) => {
    if (!player) { return }
    startDraw = true;

    ctx.beginPath();
    ctx.moveTo(e.offsetX, e.offsetY);
    ctx.lineWidth = 3;
    ctx.strokeStyle = player.color;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.shadowColor = "white";
    ctx.shadowBlur = 1;


    // buffer paths
    points.push({ mouse: "mousedown", x: e.offsetX, y: e.offsetY });
});

canvas.addEventListener("mouseup", (e) => {
    if (!player) { return }
    startDraw = false;
    points.push({ mouse: "mouseup" });

    // send left buffered paths 
    if (points.length > 0) {
        websocket.send(JSON.stringify({ type: "draw", player: player, points: points }));
        points = [];
    }
});

canvas.addEventListener("mousemove", (e) => {

    if (startDraw && player !== undefined) {

        ctx.lineTo(e.offsetX, e.offsetY);
        ctx.stroke();

        // send buffered paths
        if (points.length === pointsSize) {
            websocket.send(JSON.stringify({ type: "draw", player: player, points: points }));
            points = [];
        }

        points.push({ mouse: "mousemove", x: e.offsetX, y: e.offsetY });
    }
});



/* functions
------------------------------- */

function gameLoop(timestamp) {

    // drawing in canvas may be done in animation... 
    // ctx.clearRect(0, 0, canvas.width, canvas.height);

    setTimeout(() => {
        requestAnimationFrame(gameLoop)
    }, 1000 / fps);

}