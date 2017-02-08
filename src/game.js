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


const myPlayer = {
    x: 100,
    y: 100,
    vx: 0,
    vy: 0,
    inputs: {
        LEFT_ARROW: false,
        RIGHT_ARROW: false,
        DOWN_ARROW: false,
        UP_ARROW: false
    },
    color: randomColor()
}; // LA referencia es constante pero el contenido cambia!
let myPlayerId = null;

//hash playeId => playerData
let players = {};

let lastPingTimestap;
let clockDiff = 0;
let ping = Infinity;
const ACCEL = 1 / 1000;

var SocketController = {

    "world:init": function(serverPlayers, myId){

        myPlayerId = myId;
        myPlayer.id = myId;
        players = serverPlayers;    
        players[myId] = myPlayer;
    },

    playerMoved: function(player){
         players[player.id] = player;
         const delta = (Date.now() + clockDiff) - player.timestamp

         // increment position due the current velocity
         // and update the acceleration acordingly
         player.x += player.vx * delta + (ACCEL * Math.pow(delta,2)/2)
         player.y += player.vy * delta + (ACCEL * Math.pow(delta,2)/2)
         const {inputs} = player;
         if(inputs.LEFT_ARROW && !inputs.RIGHT_ARROW) {

             player.x -= ACCEL * Math.pow(delta,2)/2;
             player.vx -= ACCEL * delta;
         }else if(!inputs.LEFT_ARROW && inputs.RIGHT_ARROW){
                player.x += ACCEL * Math.pow(delta,2)/2;
                player.vx += ACCEL * delta;
         }

         if(inputs.UP_ARROW && !inputs.DOWN_ARROW) {

             player.y -= ACCEL * Math.pow(delta,2)/2;
             player.vy -= ACCEL * delta;
         }else if(!inputs.UP_ARROW && inputs.DOWN_ARROW){
                player.y += ACCEL * Math.pow(delta,2)/2;
                player.vy += ACCEL * delta;
         }
    },
    userDisconnect: function(playerId){

        delete players[playerId];
        console.info(`The player ${playerId} has been disconnected`);
        
    },
    "game:pong": function(serverNow){

        ping = (Date.now() - lastPingTimestap) / 2;
        clockDiff = Date.now() - serverNow+ping;
    }

    
};



function updateInputs () {
    const { inputs } = myPlayer

    for (let key in inputs) {
        inputs[key] = kb.isKeyDown(kb[key])
    }
}

function logic(delta){

    // JSON for two equal objects should be the same string
    // const oldInputs = JSON.stringify(Object.assign({}, myPlayer.inputs))
    const oldInputs = Object.assign({},  myPlayer.inputs)
    updateInputs()

    const vInc = ACCEL * delta
    for (let playerId in players) {
        const player = players[playerId]
        const { inputs } = player
        
        if (inputs.LEFT_ARROW) player.vx -= vInc
        if (inputs.RIGHT_ARROW) player.vx += vInc
        if (inputs.UP_ARROW) player.vy -= vInc
        if (inputs.DOWN_ARROW) player.vy += vInc

        let press = false;
        for(let i in inputs){
            
            if(inputs[i]){ press = true;break;}
        }

        player.x += player.vx * delta
        player.y += player.vy * delta
        
    }

    if (!deepEqual(myPlayer.inputs, oldInputs)) {
        socket.emit('move', myPlayer)
    }

}

const canvas = document.createElement("canvas");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
document.body.appendChild(canvas);
const ctx = canvas.getContext("2d");

function render(){
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, window.innerWidth, window.innerHeight)

    for(let playerId in players){
        const { color, x, y } = players[playerId];
        ctx.fillStyle = color;
        ctx.fillRect(x, y,50,50);

        if (playerId === myPlayerId) {
            ctx.strokeRect(x, y, 50, 50);
        }
    }
}

let past = Date.now();
function gameLoop(){

    requestAnimationFrame(gameLoop);
    const now = Date.now();
    const delta = now - past
    past = now
    logic(delta);
    render();
}


function startPingHandshake(){

    lastPingTimestap = Date.now();
    socket.emit('game:ping');
}

socket.on("connect", function(){

    // Register on handlers
    for( let evnt in SocketController){

        if(SocketController.hasOwnProperty(evnt)){
            socket.on(evnt, SocketController[evnt]);
        }
    }
});


setInterval(startPingHandshake,250)
requestAnimationFrame(gameLoop);