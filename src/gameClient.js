/* globals requestAnimationFrame, window  */
let Render = require('./render')
let Tank = require('./tank')
let GameCamera = require('./gameCamera')
let globals = require('./globals')
let Network = require('./net')
const deepEqual = require('deep-equal')
const kb = require('@dasilvacontin/keyboard')

globals.addGlobal('ACCEL', 1 / 1000);
let ACCEL = globals.getGlobal('ACCEL');
class GameClient {

  constructor (o) {
    let $this = this // self reference
    this.net = new Network(o.io,true)
    this.players = {}
    this.items = {}
    this.projectiles = {}
    this.lastLogic = 0
    this.clockDiff
    this.myPlayerId = null
    this.myInputs = {
      LEFT_ARROW: false,
      RIGHT_ARROW: false,
      UP_ARROW: false,
      DOWN_ARROW: false
    }

    this.gfx = Render

    this.camera = new GameCamera(-1, o.camera.x, o.camera.y, o.camera.w, o.camera.h)

    this.events = {
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
        console.log(player)
        $this.players[player.id] = new Tank(player);

        const delta = ($this.lastLogic + $this.clockDiff) - player.timestamp

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
      'world:init': $this.events.onWorldInit.bind($this),
      playerMoved: $this.events.onPlayerMoved.bind($this),
      playerDisconnected: $this.events.onPlayerDisconnected.bind($this),
      coinSpawned: $this.events.onItemSpawned.bind($this),
      coinCollected: $this.events.onItemCollected.bind($this),

      'game:pong': function (serverNow) {
        $this.net.ping = (Date.now() - $this.net.lastPingTimestamp) / 2
        $this.clockDiff = Date.now() - serverNow + $this.net.ping
      }
    }

    this.net.registerNetEvents(this.netEvents).init().send('gameJoin',{});
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

  gameRenderer () {
    this.gfx.fillStyle = 'white'
    this.gfx.fillRect(0, 0, window.innerWidth, window.innerHeight)

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

    // Render my pos
    let myPlayer = this.players[this.myPlayerId];
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
      setTimeout(function () {
        const myPlayer = this.players[this.myPlayerId]
        myPlayer.inputs = frozenInputs
      }.bind(this), this.net.ping)
    }
  }

  gameLoop () {
    requestAnimationFrame(this.gameLoop.bind(this));
    const now = Date.now()
    const delta = now - this.lastLogic
    this.lastLogic = now
    this.updateInputs()
    this.logic(delta)
    this.gameRenderer()
  }

  run () {
    requestAnimationFrame(this.gameLoop.bind(this))
  }

}

module.exports = GameClient
