"use strict";
const express = require("express");
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);


// Middleware

app.use(function(req, res, next){
    console.log(arguments);
    next();
});

const players = {};
app.use(express.static('public'));

let ping;
let lastPongTimeStamp;
const SocketController = {

    hi: function(){

    },

    move: function(player){

        const $S = this;
        console.log(`${$S.id} moved`)
        players[$S.id] = player;
        player.id = $S.id
        player.timestamp = Date.now() - ping;
        $S.broadcast.emit('playerMoved', player);

    },

    disconnect: function(){

        const $S = this;
        console.log(`User ${$S.id} has been disconnect`);
        $S.broadcast.emit("userDisconnect", $S.id);
        delete players[$S.id];
    },
    "game:ping": function(){

        const $S = this;
        lastPongTimeStamp = Date.now();
        $S.emit("game:pong", Date.now());

    },
    "game:pong": function(){

        ping = (Date.now() - lastPongTimeStamp) / 2;

    }
};

io.on('connection', function(socket){
    "use strict";
  console.log('a user connected');

  socket.emit("world:init",players, socket.id);
  let lastPongTimeStamp;
  let ping = 50;
  for(let evnt in SocketController){

      if(SocketController.hasOwnProperty(evnt)){
            socket.on(evnt, SocketController[evnt]);
      }
  }

});

http.listen(process.env.PORT || 3000, function(){
  console.log('listening on *:3000');
});