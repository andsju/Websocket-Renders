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
const tile = 10;
const players = [];
let player;
let start;



// default
gameLoop();



/* events
------------------------------- */
form.addEventListener("submit", (e) => {
    e.preventDefault();
    const elementUsername = form.querySelector("#username");
    const username = elementUsername.value;
    elementUsername.setAttribute("disabled", true);
    form.querySelector("#setPlayer").setAttribute("disabled", true);


    // request id and using api call
    fetch(`http://${IP}:8888/api/id`)
        .then(res => res.json())
        .then((obj) => {
            player = new Player(obj.id, username, obj.color, tile, randomBetween(50, canvas.width - 50), randomBetween(50, canvas.height - 50), randomDirection(randomBetween(1, 3)), randomDirection(randomBetween(1, 3)));
            players.push(player);
            console.log(player);
            websocket.send(JSON.stringify({ type: "newplayer", player: player }));
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
            const socketPlayer = new Player(obj.player.id, obj.player.username, obj.player.color, obj.player.tile, obj.player.x, obj.player.y, obj.player.vx, obj.player.vy);
            players.push(socketPlayer);

            break;

        case "online":

            // add websocket players in 'browser land'
            if (Array.isArray(obj.playersOnline)) {
                obj.playersOnline.forEach(playerOnline => {
                    const socketPlayer = new Player(playerOnline.player.id, playerOnline.player.username, playerOnline.player.color, tile, playerOnline.player.x, playerOnline.player.y);
                    players.push(socketPlayer);
                });
            }

            break;

        case "move":

            // update player position in 'browser land'
            players.forEach((player) => {
                if (player.id === obj.player.id) {
                    player.x = obj.player.x;
                    player.y = obj.player.y;
                    player.vx = obj.player.vx;
                    player.vy = obj.player.vy;
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

// keyboard
window.addEventListener("keydown", (e) => {

    if (!player) { return }

    // arrow keys
    switch (e.key) {
        case "ArrowRight":
            player.vx += player.vx < player.maxSpeed ? 2 : -0.3;
            break;
        case "ArrowDown":
            player.vy += player.vy < player.maxSpeed ? 2 : -0.3;
            break;
        case "ArrowLeft":
            player.vx -= player.vx < player.maxSpeed ? 2 : 0.3;
            break;
        case "ArrowUp":
            player.vy -= player.vy < player.maxSpeed ? 2 : 0.3;
            break;
        default:
            break;
    }

    websocket.send(JSON.stringify({ type: "move", player: player }));
});


// mobile 
canvas.addEventListener("touchstart", (e) => {
    const clientX = e.touches[0].clientX;
    const clientY = e.touches[0].clientY;

    const x = Math.round(clientX / tile);
    const y = Math.round(clientY / tile);

    if (player) {
        player.x = x * tile - tile;
        player.y = y * tile - tile;
    }

    websocket.send(JSON.stringify({ type: "move", player: player }));
})



/* functions
------------------------------- */

function gameLoop(timestamp) {

    if (start === undefined) {
        start = timestamp;
    }
    const elapsed = timestamp - start;

    // console.log(elapsed);

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setTimeout(() => {
        requestAnimationFrame(gameLoop)
    }, 1000 / fps);


    renderPlayers();
}


function renderPlayers() {
    players.forEach(player => {
        player.draw(ctx);
        player.move(canvas);
    })
}

function randomBetween(min, max) {
    return Math.random() * (max - min) + min;
}

function randomDirection(v) {
    return Math.random() > 0.5 ? v : -v;
}