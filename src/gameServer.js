const globals = require('./globals')
globals.addGlobal('ACCEL', 1 / 1000)
globals.addGlobal("SERVER",true)

const utils = require("./utils")

const randomColor = require('randomcolor')
const Network = require('./net')
const Tank = require("./tank");



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

      gameJoin: function(){

        console.log("A user has requested to join the server.")
        $this.events.onPlayerConnected(this);
      },

      move: function (inputs) {
       $this.events.onPlayerMoved(this, inputs)
      },

      rotateTurret: function(inputs) {
        console.log("Player rotate turret");
        $this.events.onPlayerRotateTurret(this, inputs)
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
          DOWN_ARROW: false,
          A: false,
          W: false,
          S: false,
          D: false,
          Q: false
        }

        const player = new Tank({
          x: Math.random() * 500,
          y: Math.random() * 500,
          width: 50,
          height: 50,
          radius: 30,
          vx: 0,
          vy: 0,
          ax: 0,
          ay: 0,
          timestamp: Date.now(),
          color: randomColor(),
          id: socket.id,
          score: 0,
          visibleObject: {}, // The actual visible objects for this player
          inputs
        });

        //console.log('Generated PLAYER=>',player);

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
        //console.log(inputs)
        console.log(`${new Date()}: ${socket.id} moved`)

        const player = $this.players[socket.id]
        const now = Date.now()
        $this.updatePlayer(player, now)

        player.inputs = inputs
        utils.calculatePlayerAcceleration(player)

        //console.log("PLAYER_NEW_ACC", player);
        socket.emit('playerMoved', player);
        socket.broadcast.emit('playerMoved', player);
      },

      onPlayerRotateTurret(socket, inputs) {

        console.log(`${new Date()}: ${socket.id} moved`)

        const player = $this.players[socket.id]
        const now = Date.now()
        $this.updatePlayer(player, now)

        player.inputs = inputs
        if(player.inputs.A)
          player.turret.orientation += 4;
        else if(player.inputs.D)
          player.turret.orientation -= 4;

        //console.log("PLAYER_NEW_ACC", player);
        socket.emit('playerRotateTurret', player);
        socket.broadcast.emit('playerRotateTurret', player);
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

  updatePlayer(player, targetTimestamp){

    const { x, y, vx, vy, ax, ay } = player

    //console.log('UPDT_PLAYER==>', x,y,vx,vy,ax,ay);
    //throw new Error("STOP");

    const delta = targetTimestamp - player.timestamp
    const delta2 = Math.pow(delta, 2)

    player.x = x + (vx * delta) + (ax * delta2 / 2)
    player.y = y + (vy * delta) + (ay * delta2 / 2)
    player.vx = vx + (ax * delta)
    player.vy = vy + (ay * delta)
    player.timestamp = targetTimestamp

    return this
  }

  logic () {
    
    const now = Date.now()

    for (let playerId in this.players) {
      const player = this.players[playerId]
      //console.log(playerId, player)
      this.updatePlayer(player, now)

      // player <-> items collision detection
      /*for (let coinId in this.coins) {
        const coin = this.coins[coinId]
        const dist = Math.abs(player.x - coin.x) + Math.abs(player.y - coin.y)
        const radiusSum = COIN_RADIUS + (PLAYER_EDGE / 2)
        if (radiusSum > dist) {
          delete this.coins[coinId]
          player.score++
          this.io.to(this.roomId).emit('coinCollected', player.id, coinId)
        }
      }*/
    }

    //this.itemSpawner()

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

    setInterval(function () {
      this.logic()
    }.bind(this), loopInterval)
  }
}

module.exports = GameServer
