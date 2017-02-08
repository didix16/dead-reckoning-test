const kb = require('@dasilvacontin/keyboard');
const randomColor = require("randomcolor");
document.addEventListener("keydown",function(e){

    e.preventDefault();
});

document.addEventListener("keyup",function(e){

    e.preventDefault();
});

const socket = io();


const myPlayer = {x: 100, y: 100, color: randomColor()}; // LA referencia es constante pero el contenido cambia!
let myPlayerId = null;

//hash playeId => playerData
let players = {};

var SocketController = {

    "world:init": function(serverPlayers, myId){

        myPlayerId = myId;
        myPlayer.id = myId;
        players = serverPlayers;    
        players[myId] = myPlayer;
    },

    playerMoved: function(player){
         players[player.id] = player;
    },
    userDisconnect: function(playerId){

        delete players[playerId];
        console.info(`The player ${playerId} has been disconnected`);
        
    }

    
};


function logic(){

    if(kb.isKeyDown(kb.LEFT_ARROW)){

        myPlayer.x--;
        socket.emit("move",myPlayer);
    }else if(kb.isKeyDown(kb.RIGHT_ARROW)){

        myPlayer.x++;
        socket.emit("move",myPlayer);
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

function gameLoop(){

    requestAnimationFrame(gameLoop);
    logic();
    render();
}

socket.on("connect", function(){

    // Register on handlers
    for( evnt in SocketController){

        if(SocketController.hasOwnProperty(evnt)){
            socket.on(evnt, SocketController[evnt]);
        }
    }
});

requestAnimationFrame(gameLoop);