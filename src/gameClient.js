/* globals requestAnimationFrame, window, $  */
let Render = require('./render')
let Tank = require('./tank')
let Projectile = require('./baseProjectile')
let GameCamera = require('./gameCamera')
let Map = require("./map");
let BaseItem = require('./baseItem')
const HealthItem = require('./healthItem')
const AmmoItem = require('./ammoItem')
let globals = require('./globals')
globals.addGlobal('ACCEL', 1 / 1000);
const ACCEL = globals.getGlobal("ACCEL");

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
      DOWN_ARROW: false,
      SPACE_BAR: false,
      A: false,
      W: false,
      S: false,
      D: false,
      Q: false
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

        var itemIds = Object.keys(data.serverItems)
        itemIds.forEach(function (itemId) {
          let item = data.serverItems[itemId]
          switch(item.type){

            case BaseItem.TYPE.HEALTH:
              $this.items[item.id] = new HealthItem(item);
              break;
            case BaseItem.TYPE.AMMO:
              $this.items[item.id] = new AmmoItem(item);
              break;
          }

        });

        var pIds = Object.keys(data.serverProjectiles)
        let projectiles = {}
        pIds.forEach(function (projId) {
          projectiles[projId] = new Projectile(data.serverProjectiles[projId])
        })

        $this.projectiles = projectiles

        $this.myPlayerId = data.myId
      },

      onPlayerMoved (player) {
        console.log("ARRIVING_PLAYER==>",player)
        $this.players[player.id] = new Tank(player);

        console.log("PLAYER_AFTER_INIT_TANK==>",$this.players[player.id])
      },

      onPlayerRotateTurret(player){

        $this.players[player.id] = new Tank(player);
      },

      onPlayerShoot(player, projectile){

        $this.players[player.id] = new Tank(player);
        $this.projectiles[projectile.id] = new Projectile(projectile);
      },

      onItemSpawned (item) {
        let alert = $("div.alert");
        alert.text("A item has spawned!");
        alert.addClass("show")
        setTimeout(() => {
          alert.addClass("animated fadeOut");
        },2000);
        alert.one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function(){

          alert.text("").removeClass("show fadeOut");
        });
        
        switch(item.type){

          case BaseItem.TYPE.HEALTH:
            $this.items[item.id] = new HealthItem(item);
            break;
          case BaseItem.TYPE.AMMO:
            $this.items[item.id] = new AmmoItem(item);
            break;
        }
        
      },

      onItemCollected (playerId, itemId) {

        let item = $this.items[itemId]
        let player = $this.players[playerId]
        switch(item.type){

          case BaseItem.TYPE.HEALTH:
            player.heal(item.use())
            break;
          case BaseItem.TYPE.AMMO:
            player.chargeAmmo(item.use())
            break;
        }
        delete $this.items[itemId]
        // const player = $this.players[playerId]
        // Do the item effect
        // player.score++
      },

      onPlayerHurt(player, projectile){
        alert("famae")
        $this.players[player.id] = new Tank(player);
        $this.players[player.id].setHealth(player.health)
        delete $this.projectiles[projectile.id];
      },

      onPlayerDead(player, projectile){

        let alert = $("div.alert");
        alert.text(`You has been killed by [ ${$this.players[projectile.owner].nickname} ]!`);
        alert.addClass("show")
        setTimeout(() => {
          alert.addClass("animated fadeOut");
        },2000);
        alert.one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function(){

          alert.text("").removeClass("show fadeOut");
        });

        $this.players[player.id] = new Tank(player);
        $this.players[player.id].setHealth(0)
        delete $this.projectiles[projectile.id];
      },
      
      onProjectileExplode(projId){

        delete $this.projectiles[projId];
      },

      onNoMoveByDead(){
        let alert = $("div.alert");
        alert.text(`You are dead, so cannot move. Wait to respawn!`);
        alert.addClass("show")
        setTimeout(() => {
          alert.addClass("animated fadeOut");
        },2000);
        alert.one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function(){

          alert.text("").removeClass("show fadeOut");
        });
      },

      onPlayerDisconnected (playerId) {
        delete $this.players[playerId]
      }
    }
    
    this.netEvents = {
      'connect': $this.events.onConnect.bind($this),
      'world:init': $this.events.onWorldInit.bind($this),
      playerMoved: $this.events.onPlayerMoved.bind($this),
      playerRotateTurret: $this.events.onPlayerRotateTurret.bind($this),
      playerShoot: $this.events.onPlayerShoot.bind($this),
      playerDisconnected: $this.events.onPlayerDisconnected.bind($this),
      itemSpawned: $this.events.onItemSpawned.bind($this),
      itemCollected: $this.events.onItemCollected.bind($this),
      playerHurt: $this.events.onPlayerHurt.bind($this),
      playerDead: $this.events.onPlayerDead.bind($this),
      projectileExplode: $this.events.onProjectileExplode.bind($this),
      'NoMove:Dead': $this.events.onNoMoveByDead.bind($this),
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
    if(player.died) return
    let { x, y, vx, vy, ax, ay, vxDir, vyDir } = player

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

  updateProjectile(projectile, targetTimestamp){

    const {direction, speed} = projectile
    const delta = targetTimestamp - projectile.timestamp

    //console.log("DIR=>>",direction, speed, delta);
    let X = projectile.x + direction.x * speed * delta;
    let Y = projectile.y + direction.y * speed * delta;
    projectile.distance += direction.x * speed * delta;
    projectile.setPosition(X,Y)

    projectile.timestamp = targetTimestamp

  }


  logic () {

    const now = Date.now()
    const serverNow = now + this.clockDiff
    this.updateInputs()

    for (let playerId in this.players) {
      const player = this.players[playerId]
      this.updatePlayer(player, serverNow)
    }

    for(let projId in this.projectiles) {

      const projectile = this.projectiles[projId]
      this.updateProjectile(projectile,serverNow)
      if(projectile.distance > projectile.MAX_DISTANCE){
        delete this.projectiles[projId];
      }
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
      let item = this.items[itemId]
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

    // Render my info
    if(myPlayer){
      Render.save();
      
      Render.font = "12px FontAwesome";
      Render.fillText('\uf041', 15,20);
      Render.strokeStyle = "black";
      Render.font = '12px arial';
      Render.strokeText("Pos: ("+parseInt(myPlayer.x)+","+parseInt(myPlayer.y)+")",30,20);
      Render.fillStyle = "white";
      Render.fillText("Pos: ("+parseInt(myPlayer.x)+","+parseInt(myPlayer.y)+")",30,20);

      Render.font = "12px FontAwesome";
      Render.fillText('\uf135', 130,20);
      Render.font = '12px arial';
      
      Render.strokeText(`Ammo: ${myPlayer.ammo}`, 150, 20)
      Render.fillText(`Ammo: ${myPlayer.ammo}`, 150, 20)

      if(myPlayer.ammo === 0){
        Render.strokeText(`[ No ammo ]`, 220, 20)
        Render.fillStyle = "red";
        Render.fillText(`[ No ammo ]`, 220, 20)
        Render.fillStyle = "white";
      }

      let perc = myPlayer.health / myPlayer.maxHealth;
      if(perc >= 0.8)
        Render.fillStyle = "#00ff00"
      else if(perc >= 0.3)
        Render.fillStyle = "#FFA500"
      else{
        Render.fillStyle = "#CC0000"
      }
        
      
      Render.font = "12px FontAwesome";
      Render.fillText('\uf004', 300,20);
      Render.font = '12px arial';
      Render.strokeText(`Health: ${myPlayer.health} / ${myPlayer.maxHealth}`, 320, 20)
      

      Render.fillText(`Health: ${myPlayer.health} / ${myPlayer.maxHealth}`, 320, 20)

      if(perc < 0.3) {
        var t = Date.now()/1000*Math.PI/2;
			  let alpha = 0.25 * Math.cos(t*1.5) + 0.5;

        Render.globalAlpha = alpha

        Render.font = "12px FontAwesome";
        Render.fillText('\uf071', 430,20);
        Render.font = '12px arial';
        
        Render.strokeText(`[ WARNING ]`, 450, 20)
        Render.fillStyle = 'yellow';
       
        Render.fillText(`[ WARNING ]`, 450, 20)
        Render.fillStyle = 'white';
      }
      
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

      if( this.myInputs.A || this.myInputs.D ){
        this.net.send('rotateTurret',this.myInputs);
      }

      if( this.myInputs.SPACE_BAR ){

        this.net.send('shoot', this.myInputs);
      }
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
