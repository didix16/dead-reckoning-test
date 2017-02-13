const globals = require('./globals')
// const utils = require("./utils");
globals.addGlobal("SERVER",true);
const randomColor = require('randomcolor')
const Network = require('./net')
const Tank = require("./tank");

globals.addGlobal('ACCEL', 1 / 1000)
const ACCEL = globals.getGlobal('ACCEL')
class GameServer {

  constructor (socketIO) {
    this.players = {}
    this.items = {}
    this.projectiles = {}
    this.nextItemId = 0
    this.net = new Network(socketIO)
    this.lastItemSpawn = Date.now()
    let $this = this // self reference

    // Generate a few items
    /*for (let i = 0; i < 10; ++i) {
      const item = {
        id: this.nextItemId++,
        x: Math.random() * 500,
        y: Math.random() * 500
      }
      this.items[item.id] = item
    }*/

    this.netEvents = {
      'game:ping': function () {
        this.emit('game:pong', Date.now())
      },

      'game:pung': function () {
                // ping = (Date.now() - lastPongTimestamp) / 2
      },

      gameJoin: function(){

        console.log("A user has requested to join the server.")
        $this.events.onPlayerConnected(this);
      },

      move: function (inputs) {
       $this.events.onPlayerMoved(this, inputs)
      },

      disconnect: function () {
        $this.events.onPlayerDisconnected(this)
      }
    }

    this.events = {


      onPlayerConnected (socket) {
        console.log(`${socket.id} connected`)
        const inputs = {
          LEFT_ARROW: false,
          RIGHT_ARROW: false,
          UP_ARROW: false,
          DOWN_ARROW: false
        }

        const player = new Tank({
          x: Math.random() * 500,
          y: Math.random() * 500,
          width: 50,
          height: 50,
          radius: 30,
          vx: 0,
          vy: 0,
          color: randomColor(),
          id: socket.id,
          score: 0,
          visibleObject: {}, // The actual visible objects for this player
          inputs
        });

        console.log('Generated PLAYER=>',player);

        $this.players[socket.id] = player

        socket.emit('world:init', {
          serverPlayers: $this.players,
          serverItems: $this.items,
          serverProjectiles: $this.projectiles,
          myId: socket.id
        })

            // so that the new players appears on other people's screen
        $this.events.onPlayerMoved(socket, inputs)
      },

      onPlayerMoved (socket, inputs) {
        console.log(inputs)
        console.log(`${new Date()}: ${socket.id} moved`)
        const player = $this.players[socket.id]
        player.timestamp = Date.now()
        player.inputs = inputs
       socket.emit('playerMoved', player)
      },

      onPlayerDisconnected (socket) {
        console.log(`${socket.id} disconnected`)
        delete $this.players[socket.id]
        socket.broadcast.emit('playerDisconnected', socket.id)
      }
    }

    // Initialize the Network
    this.net.registerNetEvents(this.netEvents).init();
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

      // Add here projectile collision and item collision
      /* for (let itemId in this.items) {
        const item = this.items[itemId]
        const dist = Math.abs(player.x - item.x) + Math.abs(player.y - item.y)

        //Add collision here

      } */

      //this.itemSpawner()
    }
  }

  itemSpawner () {
    // Item spawner
    if (Date.now() - this.lastItemSpawn > 1000) {
      const item = {
        id: this.nextItemId++,
        x: Math.random() * 500,
        y: Math.random() * 500
      }

      this.items[item.id] = item
      this.lastItemSpawn = Date.now()
      this.net.broadcast('itemSpawned', item)
    }
  }

  run (loopInterval) {
    console.log('Starting GameServer...')
    this.past = Date.now()

    setInterval(function () {
      const now = Date.now()
      const delta = now - this.past
      this.past = now
      this.logic(delta)
    }.bind(this), loopInterval)
  }
}

module.exports = GameServer
