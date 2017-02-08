const kb = require('@dasilvacontin/keyboard');
const randomColor = require("randomcolor");
const deepEqual = require("deep-equal");
document.addEventListener("keydown",function(e){

    e.preventDefault();
});

document.addEventListener("keyup",function(e){

    e.preventDefault();
});

const socket = io();


let myPlayerId = null
const myInputs = {
  LEFT_ARROW: false,
  RIGHT_ARROW: false,
  UP_ARROW: false,
  DOWN_ARROW: false
}

const ACCEL = 1 / 1000;

class GameClient{

    constructor () {
        this.players = {}
    }

    onWorldInit (serverPlayers) {
        this.players = serverPlayers
    }

    onPlayerMoved (player) {
        console.log(player)
        this.players[player.id] = player

        const delta = (Date.now() + clockDiff) - player.timestamp

            // increment position due to current velocity
            // and update our velocity accordingly
        player.x += player.vx * delta
        player.y += player.vy * delta

        const { inputs } = player
        if (inputs.LEFT_ARROW && !inputs.RIGHT_ARROW) {
            player.x -= ACCEL * Math.pow(delta, 2) / 2
            player.vx -= ACCEL * delta
        } else if (!inputs.LEFT_ARROW && inputs.RIGHT_ARROW) {
            player.x += ACCEL * Math.pow(delta, 2) / 2
            player.vx += ACCEL * delta
        }
        if (inputs.UP_ARROW && !inputs.DOWN_ARROW) {
            player.y -= ACCEL * Math.pow(delta, 2) / 2
            player.vy -= ACCEL * delta
        } else if (!inputs.UP_ARROW && inputs.DOWN_ARROW) {
            player.y += ACCEL * Math.pow(delta, 2) / 2
            player.vy += ACCEL * delta
        }
    }

    onPlayerDisconnected (playerId) {
        delete this.players[playerId]
    }

    logic (delta) {
        const vInc = ACCEL * delta
        for (let playerId in this.players) {
            const player = this.players[playerId]
            const { inputs } = player
            if (inputs.LEFT_ARROW) player.vx -= vInc
            if (inputs.RIGHT_ARROW) player.vx += vInc
            if (inputs.UP_ARROW) player.vy -= vInc
            if (inputs.DOWN_ARROW) player.vy += vInc

            player.x += player.vx * delta
            player.y += player.vy * delta
        }
    }
}

function updateInputs () {
    const oldInputs = Object.assign({}, myInputs)

    for (let key in myInputs) {
        myInputs[key] = kbd.isKeyDown(kbd[key])
    }

    if (!deepEqual(myInputs, oldInputs)) {
        socket.emit('move', myInputs)

        // update our local player' inputs so that we see instant change
        // (inputs get taken into account in logic simulation)
        const myPlayer = game.players[myPlayerId]
        myPlayer.inputs = Object.assign({}, myInputs)
    }
}


const game = new GameClient();

const canvas = document.createElement("canvas");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
document.body.appendChild(canvas);
const ctx = canvas.getContext("2d");

function gameRenderer(game){
    ctx.fillStyle = 'white'
    ctx.fillRect(0, 0, window.innerWidth, window.innerHeight)

    for (let playerId in game.players) {
        const { color, x, y } = game.players[playerId]
        ctx.fillStyle = color
        ctx.fillRect(x, y, 50, 50)
        if (playerId === myPlayerId) {
            ctx.strokeRect(x, y, 50, 50)
        }
    }
}

let past = Date.now();
function gameLoop(){

    requestAnimationFrame(gameLoop);
    const now = Date.now();
    const delta = now - past
    past = now
    updateInputs();
    game.logic(delta);
    gameRenderer(game);
}


function startPingHandshake(){

    lastPingTimestap = Date.now();
    socket.emit('game:ping');
}

setInterval(startPingHandshake,250)


var SocketController = {

    "world:init": function (serverPlayers, myId) {
        game.onWorldInit(serverPlayers)
        myPlayerId = myId
    },

    playerMoved: game.onPlayerMoved.bind(game),
    playerDisconnected: game.onPlayerDisconnected.bind(game),
    
    "game:pong": function(serverNow){

        ping = (Date.now() - lastPingTimestap) / 2;
        clockDiff = Date.now() - serverNow+ping;
    }

    
};

socket.on("connect", function(){

    // Register on handlers
    for( let evnt in SocketController){

        if(SocketController.hasOwnProperty(evnt)){
            socket.on(evnt, SocketController[evnt]);
        }
    }
});



requestAnimationFrame(gameLoop);