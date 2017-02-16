const globals = require('./globals')
globals.addGlobal('ACCEL', 1 / 1000)
globals.addGlobal("SERVER",true)

const utils = require("./utils")

const randomColor = require('randomcolor')
const Network = require('./net')
const Tank = require("./tank");
const HealthItem = require('./healthItem')



class GameServer {

  constructor (socketIO) {
    this.players = {}
    this.items = {}
    this.projectiles = {}
    this.nextItemId = 0
    this.nextProjectileId = 0
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

      shoot: function(inputs){

        console.log("Player shoot");
        $this.events.onPlayerShoot(this, inputs);
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
          SPACE_BAR: false,
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

        console.log(`${new Date()}: ${socket.id} rotated the turret`)

        const player = $this.players[socket.id]
        const now = Date.now()
        $this.updatePlayer(player, now)

        player.inputs = inputs
        if(player.inputs.A)
          player.rotateTurret(4);
        else if(player.inputs.D)
          player.rotateTurret(-4);

        //console.log("PLAYER_NEW_ACC", player);
        socket.emit('playerRotateTurret', player);
        socket.broadcast.emit('playerRotateTurret', player);
      },

      onPlayerShoot(socket, inputs){

        const player = $this.players[socket.id]
        const now = Date.now()
        $this.updatePlayer(player, now)

        player.inputs = inputs

        if(player.ammo > 0 && player.inputs.SPACE_BAR){

          let projectile = player.shoot();
          projectile.timestamp = now;
          player.ammo--;
          projectile.id = $this.nextProjectileId;
          $this.projectiles[projectile.id] = projectile;

          $this.updateProjectile(projectile,now)

          ++$this.nextProjectileId;

          socket.emit('playerShoot', player,projectile);
          socket.broadcast.emit('playerShoot', player,projectile);

        }
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

    if(!player) return // Avoid null player (In some cases here arrives a null :S)
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
    player.move();

    return this
  }

  updateProjectile(projectile, targetTimestamp){

    const {direction, speed} = projectile
    const delta = targetTimestamp - projectile.timestamp

    projectile.x += direction.x * speed * delta;
    projectile.y += direction.y * speed * delta;

    //console.log("UP_PROJECT==>",direction,speed,delta, projectile.x);

    projectile.timestamp = targetTimestamp
    
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

    for( let projId in this.projectiles) {

      const projectile = this.projectiles[projId]

      this.updateProjectile(projectile,now)
    }

    this.itemSpawner()

  }

  itemSpawner () {
    // Item spawner
    let now = Date.now();
    if ( now - this.lastItemSpawn > 5000) {
      
      const item = new HealthItem({
        id: this.nextItemId,
        x: 0 ,
        y: 0,
        width: 16,
        height: 16,
        radius: 16,
        timestamp: now

      });

      item.spawnAt(Math.floor(Math.random() * 2000) - 1000,Math.floor(Math.random() * 2000) - 1000);

      this.items[item.id] = item
      ++this.nextItemId;
      this.lastItemSpawn = now
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
