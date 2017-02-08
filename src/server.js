const express = require('express')
var app = express()
var http = require('http').Server(app)
var io = require('socket.io')(http)
const randomColor = require('randomcolor')

const ACCEL = 1 / 1000

class GameServer {

  constructor () {
    this.players = {}
  }

  onPlayerConnected (socket) {
    console.log(`${socket.id} connected`)
    const inputs = {
      LEFT_ARROW: false,
      RIGHT_ARROW: false,
      UP_ARROW: false,
      DOWN_ARROW: false
    }

    const player = {
      x: Math.random() * 500,
      y: Math.random() * 500,
      vx: 0,
      vy: 0,
      color: randomColor(),
      id: socket.id,
      inputs
    }
    this.players[socket.id] = player

    socket.emit('world:init', this.players, socket.id)

        // so that the new players appears on other people's screen
    this.onPlayerMoved(socket, inputs)
  }

  onPlayerMoved (socket, inputs) {
    console.log(inputs)
    console.log(`${new Date()}: ${socket.id} moved`)
    const player = this.players[socket.id]
    player.timestamp = Date.now()
    player.inputs = inputs
    io.sockets.emit('playerMoved', player)
  }

  onPlayerDisconnected (socket) {
    console.log(`${socket.id} disconnected`)
    delete this.players[socket.id]
    socket.broadcast.emit('playerDisconnected', socket.id)
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

// Middleware

app.use(function (req, res, next) {
  console.log(arguments)
  next()
})

app.use(express.static('public'))

const SocketController = {

  'game:ping': function () {
    this.emit('game:pong', Date.now())
  },

  'game:pung': function () {
        // ping = (Date.now() - lastPongTimestamp) / 2
  },

  move: function (inputs) {
    $game.onPlayerMoved(this, inputs)
  },

  disconnect: function () {
    $game.onPlayerDisconnected(this)
  }
}

io.on('connection', function (socket) {
  console.log('a user connected')

  $game.onPlayerConnected(socket)
  for (let evnt in SocketController) {
    if (SocketController.hasOwnProperty(evnt)) {
      socket.on(evnt, SocketController[evnt])
    }
  }
})

const $game = new GameServer()
let past = Date.now()
setInterval(function () {
  const now = Date.now()
  const delta = now - past
  past = now
  $game.logic(delta)
}, 20)

http.listen(process.env.PORT || 3000, function () {
  console.log('listening on *:3000')
})
