const globals = require('./globals')
globals.addGlobal('ACCEL', 1 / 1000)
globals.addGlobal("SERVER",true)
const ACCEL = globals.getGlobal("ACCEL");

const utils = require("./utils")

const randomColor = require('randomcolor')
const Network = require('./net')
const Tank = require("./tank");
let BaseItem = require('./baseItem')
const HealthItem = require('./healthItem')
const AmmoItem = require('./ammoItem')
const FlagItem = require('./flagItem')
const GameWorld = require('./gameWorld')


class GameServer {

  constructor (socketIO) {
    this.players = {}
    this.items = {}
    this.world = new GameWorld(4000,4000)
    this.projectiles = {}
    this.mountains = {

    };
    this.nextItemId = 0
    this.nextProjectileId = 0
    this.net = new Network(socketIO)
    this.lastItemSpawn = Date.now()
    let $this = this // self reference

    // Spawn the flag 
    setTimeout(()=>{

      this.items.flag = new FlagItem({
        id: "flag",
          x: Math.random() * 1000 ,
          y: Math.random() * 1000,
          owner: -1,
          width: 32,
          height: 32,
          radius: 32,
          timestamp: this.lastItemSpawn
      });

      console.log("The flag has spawned!!")
      $this.net.send("flagSpawned", this.items.flag);
    },20000)
    // Generate a few items
    /*for (let i = 0; i < 10; ++i) {
      const item = {
        id: this.nextItemId++,
        x: Math.random() * 500,
        y: Math.random() * 500
      }
      this.items[item.id] = item
    }*/

    for(let i = 0; i< 30;i++){

      this.mountains[i] = {
        width: Math.random() * 500,
        height: Math.random() * 500,
        x: Math.floor(Math.random() * this.world.map.width/2) - this.world.map.width/4,
        y: Math.floor(Math.random() * this.world.map.width/2) - this.world.map.width/4
      }
    }

    this.netEvents = {
      'game:ping': function () {
        this.emit('game:pong', Date.now())
      },

      gameJoin: function(data){

        console.log("A user has requested to join the server.")
        $this.events.onPlayerConnected(this,data.nickname);
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


      onPlayerConnected (socket, nickname) {
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
          nickname: nickname,
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
          serverMountains: $this.mountains,
          myId: socket.id
        })

            // so that the new players appears on other people's screen
        $this.events.onPlayerMoved(socket, inputs)
      },

      onPlayerMoved (socket, inputs) {
        //console.log(inputs)
        if(!inputs) return // Avoid invalid inputs
        const player = $this.players[socket.id]
        if(!player){
          socket.disconnect(true)
          return
        }

        const now = Date.now()
        $this.updatePlayer(player, now)

        if(player.died){
          socket.emit("NoMove:Dead",{});
          return
        }

        console.log(`${new Date()}: ${socket.id} moved`)

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

        if(player.died){
          socket.emit("NoMove:Dead",{});
          return
        }

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

        if(!player){

          socket.disconnect(true)
          return
        }

        $this.updatePlayer(player, now)

        if(player.died){
          socket.emit("NoMove:Dead",{});
          return
        }

        
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
        let player = $this.players[socket.id];
        if(player && player.carryFlag){
            let flag = $this.items.flag;
            flag.owner = -1;
            flag.x = player.x - player.width;
            flag.y = player.y
            if(flag.x > $this.world.map.width /2 || flag.x < -$this.world.map.width/2) flag.x = Math.floor(Math.random() * $this.map.width/2) - $this.world.map.width/4
            if(flag.y > $this.world.map.height /2 || flag.y < -$this.world.map.height/2) flag.y = Math.floor(Math.random() * $this.map.height/2) - $this.world.map.height/4
            $this.net.send('flagDropped',player, flag)
          }

        delete $this.players[socket.id]
        socket.broadcast.emit('playerDisconnected', socket.id)
      }
    }

    // Initialize the Network
    this.net.registerNetEvents(this.netEvents).init();
  }

  updatePlayer(player, targetTimestamp){

    if(!player) return // Avoid null player (In some cases here arrives a null :S) or player dead
    if(player.died){
      player.timestamp = targetTimestamp
      return
    }
    let { x, y, vx, vy, ax, ay, vxDir, vyDir } = player

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
    projectile.distance += direction.x * speed * delta;

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
      for (let itemId in this.items) {
        const item = this.items[itemId]
        const dist = Math.abs(player.x - item.x) + Math.abs(player.y - item.y)
        const radiusSum = item.radius + player.radius
        if (radiusSum > dist) {
          if(item.getType() === BaseItem.TYPE.HEALTH){
            let hp = item.use()
            player.heal(hp);
            delete this.items[itemId]
            this.net.send('itemCollected', player.id, itemId)
          }else if(item.getType() === BaseItem.TYPE.AMMO){
            let ammo = item.use()
            player.chargeAmmo(ammo);
            delete this.items[itemId]
            this.net.send('itemCollected', player.id, itemId)
          }else if(item.owner === -1 && item.getType() === BaseItem.TYPE.FLAG){

            player.carryFlag = true;
            item.owner = player.id;
            item.onPickup(player);
            this.net.send('flagCollected', player,item)
          }
          
          //player.score++
          
        }
      }

      for( let projId in this.projectiles) {

        const projectile = this.projectiles[projId]

        this.updateProjectile(projectile,now)
        if(projectile.distance > projectile.MAX_DISTANCE){
          this.net.send('projectileExplode',projId)
          delete this.projectiles[projId];
          continue;
        }

        if(playerId != projectile.owner){
          // check here for collision
          const dist = Math.abs(player.x - projectile.x) + Math.abs(player.y - projectile.y)
          const radiusSum = projectile.radius + player.radius
          if (radiusSum > dist) {
            
            let alive = player.setHealth(player.health-projectile.dammage)
            if(alive){
              console.log("Player hurt!")
              this.net.send('playerHurt',player, projectile)
            }else{
              console.log("Player died!")
              this.net.send('playerDead',player,projectile)
              player.timesDead++;
              player.score -= 100
              this.players[projectile.owner] += 100
              if(player.carryFlag){
                player.carryFlag = false;
                let flag = this.items.flag;
                flag.owner = -1;
                flag.onDrop(player)
                flag.x = player.x - player.width;
                flag.y = player.y

                if(flag.x > this.world.map.width /2 || flag.x < -this.world.map.width/2) flag.x = Math.floor(Math.random() * this.world.map.width/2) - this.world.map.width/4
                if(flag.y > this.world.map.height /2 || flag.y < -this.world.map.height/2) flag.y = Math.floor(Math.random() * this.world.map.height/2) - this.world.map.height/4
                this.net.send('flagDropped',player, this.items.flag)
              }
              this.playerRespawner(player)
            }
            delete this.projectiles[projId];
          }
        }
          
      }

    }

    

    this.itemSpawner()

  }

  itemSpawner () {
    // Item spawner
    let now = Date.now();
    if ( now - this.lastItemSpawn > 10000) {
      
      let type = Math.floor(Math.random() * 4)
      let item = null;
      switch(type){
        case 0:
          item = new HealthItem({
            id: this.nextItemId,
            x: 0 ,
            y: 0,
            width: 16,
            height: 16,
            radius: 16,
            timestamp: now

          });
          break;
        case 1:
        case 2:
        case 3:
          item = new AmmoItem({
            id: this.nextItemId,
            x: 0 ,
            y: 0,
            width: 16,
            height: 16,
            radius: 16,
            timestamp: now

          });
          break;
        default:
          return
      }
      

      item.spawnAt(Math.floor(Math.random() * 2000) - 1000,Math.floor(Math.random() * 2000) - 1000);

      this.items[item.id] = item
      ++this.nextItemId;
      this.lastItemSpawn = now
      this.net.broadcast('itemSpawned', item)
    }
  }

  playerRespawner(player){

    let inSeconds = 5*player.timesDead;
    setTimeout(()=>{

      player.maxHealth = 100;
      player.setHealth(100)
      player.defense = 0;
      player.ammo = 10;
      player.maxAmmo = 10;
      player.x =  Math.random() * 1000;
      player.y =  Math.random() * 1000;
      player.timestamp = Date.now()
      
      this.net.send('playerRespawned',player)

    },inSeconds*1000-this.net.ping);
    this.net.send('playerWillRespawn',player,inSeconds)
  }

  run (loopInterval) {
    console.log('Starting GameServer...')

    setInterval(function () {
      this.logic()
    }.bind(this), loopInterval)
  }
}

module.exports = GameServer
