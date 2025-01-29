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
const tile = 32;
const fps = 60;
const players = [];
let player;



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
            player = new Player(obj.id, username, obj.color, tile, tile, tile);
            players.push(player);
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
            const socketPlayer = new Player(obj.player.id, obj.player.username, obj.player.color, tile, tile, tile);
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
            player.x += player.x + tile < canvas.width ? tile : 0;
            break;
        case "ArrowDown":
            player.y += player.y + tile < canvas.height ? tile : 0;
            break;
        case "ArrowLeft":
            player.x -= player.x > 0 ? tile : 0;
            break;
        case "ArrowUp":
            player.y -= player.y > 0 ? tile : 0;
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

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setTimeout(() => {
        requestAnimationFrame(gameLoop)
    }, 1000 / fps);


    renderPlayers();
}


function renderPlayers() {
    players.forEach(player => {
        player.draw(ctx);
    })
}