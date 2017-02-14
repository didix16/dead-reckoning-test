/* globals requestAnimationFrame, window  */
let Render = require('./render')
let Tank = require('./tank')
let GameCamera = require('./gameCamera')
let Map = require("./map");
let globals = require('./globals')
globals.addGlobal('ACCEL', 1 / 1000);

let utils = require("./utils")
let Network = require('./net')
const deepEqual = require('deep-equal')
const kb = require('@dasilvacontin/keyboard')

class GameClient {

  constructor (o) {
    let $this = this // self reference
    this.net = new Network(o.io,true)
    this.players = {}
    this.items = {}
    this.projectiles = {}
    this.lastLogic = 0
    this.clockDiff = 0
    this.myPlayerId = null
    this.myInputs = {
      LEFT_ARROW: false,
      RIGHT_ARROW: false,
      UP_ARROW: false,
      DOWN_ARROW: false
    }

    this.gfx = Render

    this.camera = new GameCamera(-1, o.camera.x, o.camera.y, o.camera.w, o.camera.h)
    this.map = new Map(-2,2000,2000);

    // Test: Add map chunks. In future, let the server send us the chunks and we render them
    //this.map.addChunk(new this.map.MapChunk(0,0,0,this.map.CHUNK_SIZE,this.map.CHUNK_SIZE));

    let cols = parseInt(this.map.width*2 / this.map.CHUNK_SIZE);
    let rows = parseInt(this.map.height*2 / this.map.CHUNK_SIZE);
    
    let chunkId = 0;
    
    let cY = -this.map.height;
    let cX;
    console.log(cX,cY,cols,rows)
    for(let chunkR = 0 ;chunkR<rows;chunkR++){

      let cX = -this.map.width;
      for(let chunkC = 0 ;chunkC<cols;chunkC++){

        this.map.addChunk(new this.map.MapChunk(chunkId,cX,cY,this.map.CHUNK_SIZE,this.map.CHUNK_SIZE));
        chunkId++;
        cX += this.map.CHUNK_SIZE;
      }

      cY += this.map.CHUNK_SIZE;
    }

    this.events = {
      onConnect(){

        // On connect start pinging
        $this.net.sendPing()
      },

      onWorldInit (data) {
        console.log('INCOMING_DATA',data)
        var playerIds = Object.keys(data.serverPlayers)
        let players = {}

        // Instantiate a Tank class by plain object
        playerIds.forEach(function (playerId) {
          players[playerId] = new Tank(data.serverPlayers[playerId])
        })
        $this.players = players

        $this.items = data.serverItems
        $this.projectiles = data.serverProjectiles
        $this.myPlayerId = data.myId
      },

      onPlayerMoved (player) {
        console.log("ARRIVING_PLAYER==>",player)
        $this.players[player.id] = new Tank(player);

        console.log("PLAYER_AFTER_INIT_TANK==>",$this.players[player.id])
      },

      onItemSpawned (item) {
        $this.items[item.id] = item
      },

      onItemCollected (playerId, itemId) {
        delete $this.items[itemId]
        // const player = $this.players[playerId]
        // Do the item effect
        // player.score++
      },

      onPlayerDisconnected (playerId) {
        delete $this.players[playerId]
      }
    }
    
    this.netEvents = {
      'connect': $this.events.onConnect.bind($this),
      'world:init': $this.events.onWorldInit.bind($this),
      playerMoved: $this.events.onPlayerMoved.bind($this),
      playerDisconnected: $this.events.onPlayerDisconnected.bind($this),
      coinSpawned: $this.events.onItemSpawned.bind($this),
      coinCollected: $this.events.onItemCollected.bind($this),

      'game:pong': function (serverNow) {
        //console.log("GAME_PONG==>",serverNow);
        const now = Date.now()
        $this.net.ping = (now - $this.net.pingMessageTimestamp) / 2
        $this.clockDiff = (serverNow + $this.net.ping) - now
        setTimeout(() => {
          $this.net.sendPing()
        }, Math.max(200, $this.net.ping))
      }
    }

    this.net.registerNetEvents(this.netEvents).init().send('gameJoin',{});
  }

  updatePlayer(player, targetTimestamp){

    //console.log("UPD_PLAYER=>",player)
    // dead reckoning
    const { x, y, vx, vy, ax, ay } = player

    //console.log(player);
    //console.log("DEAD_RECO: ",x,y,vx,vy,ax,ay);

    const delta = targetTimestamp - player.timestamp
    const delta2 = Math.pow(delta, 2)

    player.x = x + (vx * delta) + (ax * delta2 / 2)
    player.y = y + (vy * delta) + (ay * delta2 / 2)
    player.vx = vx + (ax * delta)
    player.vy = vy + (ay * delta)
    player.timestamp = targetTimestamp
    player.move();

  }


  logic () {

    const now = Date.now()
    const serverNow = now + this.clockDiff
    this.updateInputs()

    for (let playerId in this.players) {
      const player = this.players[playerId]
      this.updatePlayer(player, serverNow)
    }

  }

  gameRenderer () {

    // 1. First, clear canvas
    this.gfx.fillStyle = 'white'
    this.gfx.fillRect(0, 0, window.innerWidth, window.innerHeight)

    // 2. Center the Camera to me
    let myPlayer = this.players[this.myPlayerId];
    //console.log("MY_PLAYER: ", myPlayer);
    this.camera.focusOn(myPlayer);

    // 3. Render the World
    let mapChunks = this.map.getChunks();
    for(let chId in mapChunks){

      let mapChunk = mapChunks[chId];
      mapChunk.render();
    }

    // Draw World graphic
    this.gfx.beginPath();
    this.gfx.moveTo(0,-2000);
    this.gfx.lineTo(0,2000);
    this.gfx.stroke();
    this.gfx.closePath();

    this.gfx.beginPath();
    this.gfx.moveTo(-2000,0);
    this.gfx.lineTo(2000,0);

    // Stroke world graphic lines
    this.gfx.stroke();
    this.gfx.closePath();

    for(let x = -2000;x<2000;x+=50){

        this.gfx.beginPath();
        this.gfx.moveTo(x,-5)
        this.gfx.lineTo(x,5);
        this.gfx.stroke();
        this.gfx.closePath();
        this.gfx.fillText(x,x,15);
    }

    for(let y = -2000;y<2000;y+=50){

        this.gfx.beginPath();
        this.gfx.moveTo(-5,y)
        this.gfx.lineTo(5,y);
        this.gfx.stroke();
        this.gfx.closePath();
        //this.gfx.textAlign = "center"
        this.gfx.fillText(y,5,y);
    }

    // 4. Render world objects

    // Iterate over items
    for (let itemId in this.items) {
      let item = this.projectiles[itemId]
      item.render()
    }

    // Iterate over projectiles
    for (let projectileId in this.projectiles) {
      let projectile = this.projectiles[projectileId]
      projectile.render()
    }

    for (let playerId in this.players) {
      const player = this.players[playerId]
      // this.gfx.save()
      // this.gfx.translate(player.x, player.y)

      player.render()
      // his.gfx.fillStyle = player.color
      // const HALF_EDGE = PLAYER_EDGE / 2
      // this.gfx.fillRect(-HALF_EDGE, -HALF_EDGE, PLAYER_EDGE, PLAYER_EDGE)
      // this.gfx.fillRect(x - HALF_EDGE, y - HALF_EDGE, PLAYER_EDGE, PLAYER_EDGE)
      /* if (playerId === this.myPlayerId) {
        this.gfx.strokeRect(-HALF_EDGE, -HALF_EDGE, PLAYER_EDGE, PLAYER_EDGE)
      } */

      /* this.gfx.fillStyle = 'white'
      this.gfx.textAlign = 'center'
      this.gfx.font = '20px Arial'
      this.gfx.fillText(score, 0, 7)
      this.gfx.restore() */
    }

    // 5. Restore the Camera (so return to origin canvas)
    this.camera.restoreFocus();

    // Render my pos
    
    if(myPlayer){
      Render.save();
      Render.font = '12px arial';
      Render.strokeStyle = "black";
      Render.strokeText("Pos: ("+parseInt(myPlayer.x)+","+parseInt(myPlayer.y)+")",30,20);
      Render.fillStyle = "white";
      Render.fillText("Pos: ("+parseInt(myPlayer.x)+","+parseInt(myPlayer.y)+")",30,20);
      
      Render.restore();
    }
  }

  updateInputs () { 
    const oldInputs = Object.assign({}, this.myInputs)

    for (let key in this.myInputs) {
      this.myInputs[key] = kb.isKeyDown(kb[key])
    }



    if (!deepEqual(this.myInputs, oldInputs)) {
      this.net.send('move', this.myInputs)

      // update our local player' inputs aproximately when the server
      // takes them into account
      const frozenInputs = Object.assign({}, this.myInputs)
      setTimeout(() => {
        const myPlayer = this.players[this.myPlayerId]
        const now = Date.now()
        const serverNow = now + this.clockDiff
        this.updatePlayer(myPlayer, serverNow)
        myPlayer.inputs = frozenInputs
        utils.calculatePlayerAcceleration(myPlayer)
      }, this.net.ping)
    }
  }

  gameLoop () {
    requestAnimationFrame(this.gameLoop.bind(this));
    this.updateInputs()
    this.logic()
    this.gameRenderer()
  }

  run () {
    requestAnimationFrame(this.gameLoop.bind(this))
  }

}

module.exports = GameClient
