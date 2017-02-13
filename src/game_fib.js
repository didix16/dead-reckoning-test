/* globals requestAnimationFrame, io */
const kb = require('@dasilvacontin/keyboard')
const deepEqual = require('deep-equal')
document.addEventListener('keydown', function (e) {
  e.preventDefault()
})

document.addEventListener('keyup', function (e) {
  e.preventDefault()
})

const socket = io()

let myPlayerId = null
const myInputs = {
  LEFT_ARROW: false,
  RIGHT_ARROW: false,
  UP_ARROW: false,
  DOWN_ARROW: false
}

const {ACCEL, COIN_RADIUS, PLAYER_EDGE} = require('./constants')

class GameClient {

  constructor () {
    this.players = {}
    this.coins = {}
  }

  onWorldInit (serverPlayers, serverCoins, myId) {
    this.players = serverPlayers
    this.coins = serverCoins
    myPlayerId = myId
    console.log('Server coins', this.coins)
  }

  onPlayerMoved (player) {
    console.log(player)
    this.players[player.id] = player

    const delta = (lastLogic + clockDiff) - player.timestamp

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

  onCoinSpawned (coin) {
    this.coins[coin.id] = coin
  }

  onCoinCollected (playerId, coinId) {
    delete this.coins[coinId]
    const player = this.players[playerId]
    player.score++
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
    myInputs[key] = kb.isKeyDown(kb[key])
  }

  if (!deepEqual(myInputs, oldInputs)) {
    socket.emit('move', myInputs)

    // update our local player' inputs aproximately when the server
    // takes them into account
    const frozenInputs = Object.assign({}, myInputs)
    setTimeout(function () {
      const myPlayer = game.players[myPlayerId]
      myPlayer.inputs = frozenInputs
    }, ping)
  }
}

const game = new GameClient()

const canvas = document.createElement('canvas')
canvas.width = window.innerWidth
canvas.height = window.innerHeight
document.body.appendChild(canvas)
const ctx = canvas.getContext('2d')

function gameRenderer (game) {
  ctx.fillStyle = 'white'
  ctx.fillRect(0, 0, window.innerWidth, window.innerHeight)

  for (let coinId in game.coins) {
    const coin = game.coins[coinId]
    ctx.fillStyle = 'yellow'
    ctx.beginPath()
    ctx.arc(coin.x, coin.y, COIN_RADIUS, 0, 2 * Math.PI)
    ctx.fill()
  }

  for (let playerId in game.players) {
    const { color, x, y, score } = game.players[playerId]
    ctx.save()
    ctx.translate(x, y)
    ctx.fillStyle = color
    const HALF_EDGE = PLAYER_EDGE / 2
    ctx.fillRect(-HALF_EDGE, -HALF_EDGE, PLAYER_EDGE, PLAYER_EDGE)
    // ctx.fillRect(x - HALF_EDGE, y - HALF_EDGE, PLAYER_EDGE, PLAYER_EDGE)
    if (playerId === myPlayerId) {
      ctx.strokeRect(-HALF_EDGE, -HALF_EDGE, PLAYER_EDGE, PLAYER_EDGE)
    }

    ctx.fillStyle = 'white'
    ctx.textAlign = 'center'
    ctx.font = '20px Arial'
    ctx.fillText(score, 0, 7)
    ctx.restore()
  }
}

let lastLogic = Date.now()
function gameLoop () {
  requestAnimationFrame(gameLoop)
  const now = Date.now()
  const delta = now - lastLogic
  lastLogic = now
  updateInputs()
  game.logic(delta)
  gameRenderer(game)
}

let lastPingTimestamp
let clockDiff = 0 // how many ms the server is ahead from us
let ping = Infinity

function startPingHandshake () {
  lastPingTimestamp = Date.now()
  socket.emit('game:ping')
}

setInterval(startPingHandshake, 250)

var SocketController = {

  'world:init': game.onWorldInit.bind(game),
  playerMoved: game.onPlayerMoved.bind(game),
  playerDisconnected: game.onPlayerDisconnected.bind(game),
  coinSpawned: game.onCoinSpawned.bind(game),
  coinCollected: game.onCoinCollected.bind(game),

  'game:pong': function (serverNow) {
    ping = (Date.now() - lastPingTimestamp) / 2
    clockDiff = Date.now() - serverNow + ping
  }

}

socket.on('connect', function () {
    // Register on handlers
  for (let evnt in SocketController) {
    if (SocketController.hasOwnProperty(evnt)) {
      socket.on(evnt, SocketController[evnt])
    }
  }
})

requestAnimationFrame(gameLoop)
