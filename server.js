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


const SocketController = {

    hi: function(){

    },

    move: function(player){

        const $S = this;
        console.log(`${$S.id} moved`)
        players[$S.id] = player;
        player.id = $S.id
        $S.broadcast.emit('playerMoved', player);

    },

    disconnect: function(){

        const $S = this;
        console.log(`User ${$S.id} has been disconnect`);
        $S.broadcast.emit("userDisconnect", $S.id);
        delete players[$S.id];
    }
};

io.on('connection', function(socket){
  console.log('a user connected');

  socket.emit("world:init",players, socket.id);
  for( evnt in SocketController){

      if(SocketController.hasOwnProperty(evnt)){
            socket.on(evnt, SocketController[evnt]);
      }
  }

});

http.listen(process.env.PORT || 3000, function(){
  console.log('listening on *:3000');
});