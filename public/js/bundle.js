(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var pSlice = Array.prototype.slice;
var objectKeys = require('./lib/keys.js');
var isArguments = require('./lib/is_arguments.js');

var deepEqual = module.exports = function (actual, expected, opts) {
  if (!opts) opts = {};
  // 7.1. All identical values are equivalent, as determined by ===.
  if (actual === expected) {
    return true;

  } else if (actual instanceof Date && expected instanceof Date) {
    return actual.getTime() === expected.getTime();

  // 7.3. Other pairs that do not both pass typeof value == 'object',
  // equivalence is determined by ==.
  } else if (!actual || !expected || typeof actual != 'object' && typeof expected != 'object') {
    return opts.strict ? actual === expected : actual == expected;

  // 7.4. For all other Object pairs, including Array objects, equivalence is
  // determined by having the same number of owned properties (as verified
  // with Object.prototype.hasOwnProperty.call), the same set of keys
  // (although not necessarily the same order), equivalent values for every
  // corresponding key, and an identical 'prototype' property. Note: this
  // accounts for both named and indexed properties on Arrays.
  } else {
    return objEquiv(actual, expected, opts);
  }
}

function isUndefinedOrNull(value) {
  return value === null || value === undefined;
}

function isBuffer (x) {
  if (!x || typeof x !== 'object' || typeof x.length !== 'number') return false;
  if (typeof x.copy !== 'function' || typeof x.slice !== 'function') {
    return false;
  }
  if (x.length > 0 && typeof x[0] !== 'number') return false;
  return true;
}

function objEquiv(a, b, opts) {
  var i, key;
  if (isUndefinedOrNull(a) || isUndefinedOrNull(b))
    return false;
  // an identical 'prototype' property.
  if (a.prototype !== b.prototype) return false;
  //~~~I've managed to break Object.keys through screwy arguments passing.
  //   Converting to array solves the problem.
  if (isArguments(a)) {
    if (!isArguments(b)) {
      return false;
    }
    a = pSlice.call(a);
    b = pSlice.call(b);
    return deepEqual(a, b, opts);
  }
  if (isBuffer(a)) {
    if (!isBuffer(b)) {
      return false;
    }
    if (a.length !== b.length) return false;
    for (i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) return false;
    }
    return true;
  }
  try {
    var ka = objectKeys(a),
        kb = objectKeys(b);
  } catch (e) {//happens when one is a string literal and the other isn't
    return false;
  }
  // having the same number of owned properties (keys incorporates
  // hasOwnProperty)
  if (ka.length != kb.length)
    return false;
  //the same set of keys (although not necessarily the same order),
  ka.sort();
  kb.sort();
  //~~~cheap key test
  for (i = ka.length - 1; i >= 0; i--) {
    if (ka[i] != kb[i])
      return false;
  }
  //equivalent values for every corresponding key, and
  //~~~possibly expensive deep test
  for (i = ka.length - 1; i >= 0; i--) {
    key = ka[i];
    if (!deepEqual(a[key], b[key], opts)) return false;
  }
  return typeof a === typeof b;
}

},{"./lib/is_arguments.js":2,"./lib/keys.js":3}],2:[function(require,module,exports){
var supportsArgumentsClass = (function(){
  return Object.prototype.toString.call(arguments)
})() == '[object Arguments]';

exports = module.exports = supportsArgumentsClass ? supported : unsupported;

exports.supported = supported;
function supported(object) {
  return Object.prototype.toString.call(object) == '[object Arguments]';
};

exports.unsupported = unsupported;
function unsupported(object){
  return object &&
    typeof object == 'object' &&
    typeof object.length == 'number' &&
    Object.prototype.hasOwnProperty.call(object, 'callee') &&
    !Object.prototype.propertyIsEnumerable.call(object, 'callee') ||
    false;
};

},{}],3:[function(require,module,exports){
exports = module.exports = typeof Object.keys === 'function'
  ? Object.keys : shim;

exports.shim = shim;
function shim (obj) {
  var keys = [];
  for (var key in obj) keys.push(key);
  return keys;
}

},{}],4:[function(require,module,exports){
let BaseItem = require('./baseItem')
let Rectangle = require('./rectangle')
class AmmoItem extends BaseItem
{

	constructor(o){

        super(o);
        this.setType(BaseItem.TYPE.AMMO);
        this.effect = BaseItem.EFFECT.CHARGE_AMMO;

        this.owner = o.owner || null;
        this.body = new Rectangle(o.x || 0,o.y || 0,this.width,this.height);
        this.usable = true;
        this.used = o.used || false
        this.timestamp = o.timestamp || this.timestamp

    }

    // At the moment allways return 5, means the ammo to be restored
    use(){

        this.used = true;
        return 5;
    }

	render(){
		
        
		this.gfx.save();
        
        let POS_W = - this.width/2
        let POS_H = - this.height/2
        this.gfx.translate(POS_W,POS_H);
        this.body.render("#966F33",true);
		this.gfx.font = "12px FontAwesome";
		this.gfx.fillStyle = "#000000";
		this.gfx.fillText('\uf135',this.x-1+this.width/4 , this.y + this.height-12+this.height/2);
		this.gfx.restore();

		return this;
	};

}

module.exports = AmmoItem
},{"./baseItem":5,"./rectangle":21}],5:[function(require,module,exports){
let GameObject = require('./gameObject')
class BaseItem extends GameObject
{   

    constructor(o){
        super(o.id,o.x,o.y,o.width,o.height,o.radius)
        this.owner = null;

        // The body that represents the item on the ground
        this.body = null;

        // Constants that represent what kind of item is
        

        this.type = -1; // By default JOKE

        this.effect = -1; // By default nothing

        this.usable = false; // Tells if the item is usable or not
        this.used = false; // Only meaning if the item is usable
        this.timestamp = 0;
    }

	getType(){

		return this.type;
	}


	setType(t){

		this.type = t;

		// Makes the item usable if the type of item is a trap
		if(this.type == BaseItem.TYPE.TRAP) this.usable = true;
		return this;
	};

	getEffect(){

		return this.effect;
	}

	// Interface method
	effectHandler(params){ return this};

	playerInArea(player){

	};

	pickUp(player){

        return this;
	};

	// Triggers only the onUsed event if the item is usable
	use(player){

		return this;
	};

	// Spawn the item at pos(x,y). If x or y don't belongs to wolrd coordinates, return false, else trigger spawnItem event
	spawnAt(x,y){

		this.x = x;
		this.y = y;

		if(this.body && this.body.x !== undefined && this.body.y !== undefined){
			this.body.x = x;
			this.body.y = y;
		}else{
			console.error("BaseItem::spawnAt: the item has not a body to be drawed");
			return false;
		}

		return this;
	};

	render(){

		return this;
	};

}

// Static variables
BaseItem.TYPE = {

	JOKE: -1, // Means on pickup can explode and substract health
	HEALTH: 0,
	AMMO: 1, // Example: Missiles
	TRAP: 2, // Example, can be a IA Turret, Mine, etc..
	WEAPON: 3, // Not implemented yet
	FLAG: 4 // For CTF
};

// Constants that represent what kind of effect makes the item
BaseItem.EFFECT = {
	NONE: -1,
	HEALTH: 0,
	CHARGE_AMMO: 1,
	DAMAGE: 2,
	BONUS: 3

};

module.exports = BaseItem
},{"./gameObject":12}],6:[function(require,module,exports){
const GameObject = require('./gameObject')
const Circle = require('./circle')
class BaseProjectile extends GameObject
{

  constructor (o) {
    super(o.id, o.x, o.y, o.width, o.height, o.radius)

    this.owner = o.owner || 0 // player id

    this.body = new Circle(this.x, this.y, this.radius)
    this.dammage = o.damage

    this.isExplosive = false

    this.timestamp = o.timestamp || 0
    this.translateX = o.translateX || this.translateX
    this.translateY = o.translateY || this.translateY

    this.direction = o.direction || {
      x: 0,
      y: 0
    }

        /* this.speed = {
            x: 0,
            y: 0
        }; */

    this.speed = o.speed || 0.0

    // The distance since was fired
    this.distance = o.distance || 0
    this.MAX_DISTANCE = 1000
  }

  getId () {
    return this.id
  };

  setPosition (x, y) {
    this.x = x
    this.y = y

    this.body.x = x
    this.body.y = y

    return this
  };

  hitsWith (posX, posY) {

  };

  destroy () {
    delete this
  };

  render () {

    this.gfx.translate(-this.translateX,-this.translateY)
    this.body.render('#fff', true)
    this.gfx.translate(this.translateX,this.translateY)
    return this
  }

}

module.exports = BaseProjectile

},{"./circle":7,"./gameObject":12}],7:[function(require,module,exports){
const Renderable = require('./renderable')
class Circle extends Renderable
{
  constructor (x, y, r) {
    super()
    this.x = x
    this.y = y
    this.radius = r
    this.scale = 1.0
  }

  setScale (s) {
    this.scale = s
    return this
  };

  render (color, fill) {
    this.gfx.save();
    this.gfx.beginPath()
    this.gfx.arc(this.x, this.y, this.radius * this.scale, 0, 2 * Math.PI)
    this.gfx.strokeStyle = color
    this.gfx.stroke()
    if (fill) {
      this.gfx.fillStyle = color
      this.gfx.fill()
    }
    this.gfx.restore();
  };
}

module.exports = Circle

},{"./renderable":23}],8:[function(require,module,exports){
let BaseItem = require('./baseItem')
class FlagItem extends BaseItem
{

	constructor(o){

        super(o);
        this.setType(BaseItem.TYPE.FLAG);
        this.effect = BaseItem.EFFECT.BONUS;

        this.owner = o.owner || null;
        this.body = null;
        this.usable = false;
        this.timestamp = o.timestamp || this.timestamp

    }

    onPickup(player){

        player.bonus = {
            increase: {
                maxHealth: 500,
                maxAmmo: 25,
                defense: 2
            },
            timmer : setInterval(()=>{

                player.score++;
            },500)
        }

        for(let prop in player.bonus.increase){

            player[prop] += player.bonus.increase[prop]
        }

        player.setHealth(player.health+player.bonus.increase.maxHealth);
        player.ammo += player.bonus.increase.maxAmmo;
    }

    onDrop(player){

        clearInterval(player.bonus.timmer);
        for(let prop in player.bonus.increase){

            player[prop] -= player.bonus.increase[prop]
        }

        player.setHealth(player.health-player.bonus.increase.maxHealth)
        player.ammo -= player.bonus.increase.maxAmmo;
        if(player.ammo < 0) player.ammo = 0
        player.bonus = {}
    }

	render(){
		
        
		this.gfx.save();
        
        let POS_W = - this.width/2
        let POS_H = - this.height/2
        this.gfx.translate(POS_W,POS_H);
		this.gfx.font = this.width+"px FontAwesome";
		this.gfx.fillStyle = "#FF0000";
		this.gfx.fillText('\uf024',this.x , this.y);
		this.gfx.restore();

		return this;
	};

}

module.exports = FlagItem
},{"./baseItem":5}],9:[function(require,module,exports){
/* globals io, window */

// tool de test_ coverage && coverall
// travis CI
// Assertion library: Chai -> expect
// Unexpected.js
// dot-only-haunter
document.addEventListener('keydown', function (e) {
  e.preventDefault()
})

document.addEventListener('keyup', function (e) {
  e.preventDefault()
})

var globals = require('./globals')

const canvas = document.createElement('canvas')
canvas.setAttribute('style', 'font-family:fontawesome;position:absolute')
canvas.width = window.innerWidth
canvas.height = window.innerHeight
document.body.appendChild(canvas)

const eventHistory = document.querySelector('div.event-box .content')
const leaderboard = document.querySelector('div.leaderbox .content')

globals.addGlobal('canvas', canvas) // Make the canvas visible for all to render
globals.addGlobal('eventHistory', eventHistory)
globals.addGlobal('leaderboard', leaderboard)
globals.addGlobal('nickname', window.prompt('Introduce tu nickname', ''))

const GameClient = require('./gameClient')

const socketIO = io

const game = new GameClient({
  io: socketIO,
  camera: {
    x: 0,
    y: 0,
    w: canvas.width,
    h: canvas.height
  }
})

window.game = game

game.run()

},{"./gameClient":11,"./globals":13}],10:[function(require,module,exports){
const GameObject = require('./gameObject')
/**
 * A camera that foucus the scene in some part of the game world or to a game object
 * @public
 * @param {integer} x - GameCamera x coordinate position
 * @param {integer} y - GameCamera y coordinate position
 * @param {width} width - The width of the GameCamera
 * @param {height} height - The height of the GameCamera
 * @constructor {GameCamera} GameCamera
 */
class GameCamera extends GameObject {

  constructor (id = -1, x, y, width, height) {
    super(id, x, y, width, height)
    this.isFocusedOnSomething = false
  }

    /**
     * Centers the camera to the object
     * @function GameCamera.focusOn
     * @param {GameObject} object - A GameObject to be focused on
     * @return {GameCamera} - Return a self reference for chaining
     */
  focusOn (object) {
    
    if(!object) return this;
    this.gfx.save()
    this.x = 0
    this.y = 0

    this.gfx.translate(this.width/2 - object.x - this.x, this.height/2 - object.y - this.y)
    //Render.gfx.restore()
    this.isFocusedOnSomething = true
    return this
  }
  
  /**
   * Restores the canvas origin. (Avoid inifinite translate) Must be used if focusOn is used
   * @return {GameCamera} - The self instance for chaining
   * 
   * @memberOf GameCamera
   */
  restoreFocus(){

    if(this.isFocusedOnSomething) this.gfx.restore()
    return this;
  }
}

module.exports = GameCamera

},{"./gameObject":12}],11:[function(require,module,exports){
/* globals requestAnimationFrame, window, $  */
let Render = require('./render')
let Tank = require('./tank')
let Projectile = require('./baseProjectile')
let GameCamera = require('./gameCamera')
let Map = require("./map");
let BaseItem = require('./baseItem')
const HealthItem = require('./healthItem')
const AmmoItem = require('./ammoItem')
const FlagItem = require('./flagItem')
let globals = require('./globals')
globals.addGlobal('ACCEL', 1 / 1000);
const ACCEL = globals.getGlobal("ACCEL");

let utils = require("./utils")
let Network = require('./net')
const deepEqual = require('deep-equal')
// I use a improved version. I do the modifications here for compatibility in heroku
const kb = require('./keyboard')
var keyCodes = {
  SPACE_BAR: 32,

  LEFT_ARROW: 37,
  UP_ARROW: 38,
  RIGHT_ARROW: 39,
  DOWN_ARROW: 40,
  A: 65,
  W: 85,
  S: 83,
  D: 68,
  Q: 81
}

class GameClient {

  constructor (o) {
    let $this = this // self reference
    this.eventHistory = globals.getGlobal('eventHistory')
    this.leaderBoard = globals.getGlobal('leaderboard')
    this.net = new Network(o.io,true)
    this.players = {}
    this.ranking = []
    this.items = {}
    this.projectiles = {}
    this.lastLogic = 0
    this.clockDiff = 0
    this.myPlayerId = null
    this.myNickname = globals.getGlobal('nickname')
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
        $this.addEventHistory(`Welcome [${$this.myNickname}] to Tank.io. <br>You have to kill everyone, special who carry's <br>the flag!`)
        var playerIds = Object.keys(data.serverPlayers)
        let players = {}

        // Instantiate a Tank class by plain object
        playerIds.forEach(function (playerId) {
          players[playerId] = new Tank(data.serverPlayers[playerId])
        })
        $this.players = players
        $this.updateRanking();

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
        if(!$this.players[player.id]){
          $this.showAlert(`Player [${player.nickname}] is ready for the party!`)
          $this.addEventHistory(`<i class="fa fa-user"></i> Player [${player.nickname}] is ready for the party!`)
        }
        $this.players[player.id] = new Tank(player);
  
        $this.updateRanking();

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

        $this.showAlert("A item has spawned!");
        $this.addEventHistory("A item has spawned!")
        
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
            let amount = player.health;
            player.heal(item.use())
            let amount2 = player.health;
            $this.addEventHistory(`<i class="fa fa-arrow-up"></i> We have <span style="color:green">restored +${amount2-amount} <i class="fa fa-heart"></i></span>`)
            break;
          case BaseItem.TYPE.AMMO:
            let a = player.ammo;
            player.chargeAmmo(item.use())
            let a2 = player.ammo;
            $this.addEventHistory(`<i class="fa fa-arrow-up"></i> We have  <span style="color:green">charged +${a2-a} <i class="fa fa-rocket"></i></span>`)
            break;
        }
        delete $this.items[itemId]
        // const player = $this.players[playerId]
        // Do the item effect
        // player.score++
      },

      onPlayerHurt(player, projectile){
        $this.players[player.id] = new Tank(player);
        this.updateRanking();
        $this.players[player.id].setHealth(player.health)
        delete $this.projectiles[projectile.id];
      },

      onPlayerDead(player, projectile){

        if(player.id != $this.myPlayerId){
          $this.showAlert(`You has been killed by [ ${$this.players[projectile.owner].nickname} ]!`);
          $this.addEventHistory(`<i style="color:red" class="fa fa-thumbs-down"></i> You has been killed by <span style="color:orange">[ ${$this.players[projectile.owner].nickname} ]</span>`)
        }
        else{
          $this.showAlert(`You has killed [ ${$this.players[player.id].nickname} ]!`)
          $this.addEventHistory(`<i style="color:green" class="fa fa-thumbs-up"></i> You has killed <span style="color:orange">[ ${$this.players[player.id].nickname} ]</span>!`)
        }

        $this.players[player.id] = new Tank(player);
        $this.updateRanking();
        $this.players[player.id].setHealth(0)
        delete $this.projectiles[projectile.id];
      },
      
      onProjectileExplode(projId){

        delete $this.projectiles[projId];
      },

      onNoMoveByDead(){
        $this.showAlert(`You are dead, so cannot move. Wait to respawn!`);
        $this.addEventHistory(`<i style="color:red" class="fa fa-ban"></i> You are dead, so cannot move. Wait to respawn!`)
        
      },

      onFlagSpawned(flag){

         $this.items['flag'] = new FlagItem(flag);
         // Anounce to everyone
         $this.showAlert(`The flag has spawned!`);
         $this.addEventHistory(`<span style="color:green">The flag <i class="fa fa-flag"></i> has spawned!</span>`)
      },

      onFlagCollected(player, flag){

        $this.items.flag = new FlagItem(flag);
        $this.players[player.id] = new Tank(player);
        $this.updateRanking();

        if(flag.owner == this.myPlayerId){
          $this.showAlert(`You have picked up the flag!`);
          $this.addEventHistory(`<i style="color:green" class="fa fa-flag"></i> You have <span style="color:green">picked up</span> the flag!`)
        }else{
          $this.addEventHistory(`< class="fa fa-flag"></i>Player <span style="color:orange">[ ${player.nickname} ]</span> picked up the flag!`)
        }

        // Anounce to everyone
      },

      onFlagDropped(player, flag){

        $this.items.flag = new FlagItem(flag);
        $this.players[player.id] = new Tank(player);
        $this.updateRanking();
        // Anounce to everyone
      },

      onPlayerWillRespawn(player, seconds){

        $this.showAlert(`You will be respawned in ${seconds} seconds! Hold on...`);
        $this.addEventHistory(`<i style="color:black" class="fa fa-ambulance"></i> You will be respawned in ${seconds} seconds! Hold on...`)
         $this.players[player.id] = new Tank(player);
        // Anounce to me
      },

      onPlayerRespawned(player){

         $this.players[player.id] = new Tank(player);
         $this.updateRanking();
         // Anounce to me (and maybe to everyone?)
      },

      onPlayerDisconnected (playerId) {
        delete $this.players[playerId]
        $this.updateRanking();
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
      
      flagSpawned: $this.events.onFlagSpawned.bind($this),
      flagCollected: $this.events.onFlagCollected.bind($this),
      flagDropped: $this.events.onFlagDropped.bind($this),
      playerWillRespawn: $this.events.onPlayerWillRespawn.bind($this),
      playerRespawned: $this.events.onPlayerRespawned.bind($this),

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

    this.net.registerNetEvents(this.netEvents).init().send('gameJoin',{nickname: this.myNickname});
  }

  showAlert(message){
    let alert = $("div.alert");
    alert.text(message);
    alert.addClass("show")
    setTimeout(() => {
      alert.addClass("animated fadeOut");
    },2000);
    alert.one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function(){

      alert.text("").removeClass("show fadeOut");
    });

    return this;
  }

  addEventHistory(text){

    let d = new Date();

    let h = d.getHours();
    let m = d.getMinutes();
    let s = d.getSeconds();
    h = h < 10 ? "0"+h : h;
    m = m < 10 ? "0"+m : m;
    s = s < 10 ? "0"+s : s;
    let dString = h+":"+m+":"+s
    this.eventHistory.innerHTML += `[ ${dString} ]  `+text+"\n";
    $(".event-box").animate({ scrollTop: $(document).height() }, "slow");

    return this;
  }

  updateRanking(){

    this.ranking = [];

    for(let pId in this.players){

      this.ranking.push(this.players[pId]);
    }

    this.ranking.sort(function(a,b){

      if(a.score > b.score) return -1
      else if(a.score < b.score) return 1
      else return 0
    });
    
    this.leaderBoard.innerHTML = "";
    for(let i in this.ranking){

      let p = this.ranking[i];
      let idx = parseInt(i)+1;
      this.leaderBoard.innerHTML += `${idx}. ${p.nickname} - ${p.score}`
    }

    return this;
    
  }

  updatePlayer(player, targetTimestamp){

    //console.log("UPD_PLAYER=>",player)
    // dead reckoning
    if(player.died){
      player.timestamp = targetTimestamp
      return
    }
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
      if(item.getType() !== BaseItem.TYPE.FLAG || item.getType() === BaseItem.TYPE.FLAG && this.items.flag.owner === -1)
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

},{"./ammoItem":4,"./baseItem":5,"./baseProjectile":6,"./flagItem":8,"./gameCamera":10,"./globals":13,"./healthItem":14,"./keyboard":15,"./map":16,"./net":18,"./render":22,"./tank":25,"./utils":26,"deep-equal":1}],12:[function(require,module,exports){
const Renderable = require('./renderable')

/**
 * Represents a in-game object in 2D. Has a x,y width and height
 * @public
 * @constructor {GameObject} GameObject
 * @class {GameObject} GameObject
 */
class GameObject extends Renderable {

    /**
     * @func constructor
     * @param {integer} id - The unique identifier of this GameObject
     * @param {integer} x - The initial X object coordinate position
     * @param {integer} y - The initial X object coordinate position
     * @param {integer} width - The width of the object
     * @param {integer} height - The height of the object
     * @param {integer} radius - The radius of the object
     */
  constructor (id = 0, x = 0, y = 0, width = 0, height = 0, radius = 0) {
    super()
    this.id = id
    this.x = x
    this.y = y
    this.width = width
    this.height = height
    this.radius = radius
    this.center = {
      x: this.x + this.width / 2,
      y: this.y + this.height / 2
    }

        // Initial speed at 0
    this.vx = 0
    this.vy = 0
  }

    /**
     * Set the position of the object in the world
     * @public
     * @param {integer} x - The new X coordinate
     * @param {integer} y - The new Y coordinate
     * @return {GameObject} - Return self instance for chaining
     */
  setPosition (x, y) {
    this.x = x
    this.y = y
    return this
  }

    /**
     * Set the speed of the object in the world
     * @public
     * @param {double} sx - Speed X value
     * @param {double} sy - Speed Y value
     * @return {GameObject} - Return self instance for chaining
     */
  setSpeed (sx, sy) {
    this.vx = sx
    this.vy = sy
    return this
  }

    /**
     * Get the current position of the object in the world
     * @public
     * @return {PlainObject} - A plain object with x and y keys identifying the object position
     */
  getPosition () {
    return {x: this.x, y: this.y}
  }

    /**
     * Set the width of this object
     * @public
     * @param {integer} width - The new width of the object
     * @return {GameObject} - Return self instance for chaining
     */
  setWidth (width) {
    this.width = width
    this.center.x = this.x + this.width / 2
    return this
  }

    /**
     * Set the height of this object
     * @public
     * @param {integer} height - The new height of the object
     * @return {GameObject} - Return self instance for chaining
     */
  setHeight (height) {
    this.height = height
    this.center.y = this.y + this.width / 2
    return this
  }

    /**
     * @public
     * @return {PlainObject} - Return a plain object with x and y keys identifying the GameObject center coordinates
     */
  getCenter () {
    return this.center
  }

    /**
     * @public
     * @return {integer} - Returns the self radius. This number will be > 0. If, means this GameObject is not propertly initialized
     */
  getRadius () {
    return this.radius
  }

    /**
     * Check if this object collides with another
     * @public
     * @param {GameObject} object - The GameObject to check if this collide with it
     * @return {boolean} - Return true if this GameObject collides with object, else return false
     */
  collidesWith (object) {
        // Just check the circular collision
    let center = this.getCenter()
    let oCenter = object.getCenter()

        // Calc Manhattan distance: Check at google
    let distX = Math.abs(center.x - oCenter.x)
    let distY = Math.abs(center.y - oCenter.y)

    let radiusSum = this.getRadius() + object.getRadius()

    return (radiusSum >= distX || radiusSum >= distY)
  }

    /**
     * A method that each GameObject must be implemented for self rendering in the GameWorld.
     * @public
     * @return {GameObject} - Return self instance for chaining
     */
  render () {

    return this
  }
}

module.exports = GameObject

},{"./renderable":23}],13:[function(require,module,exports){
let globals = {

  vars: {},
  consts: {

  },
    /**
     * Adds a global var to be accesible form anywhere
     * @param {String} key
     * @param {any} value
     * @return {PlainObject} - Returns global object for chaining
    */
  addGlobal (key, value) {
    this.vars[key] = value
    return this
  },

    /**
     * The value of the global with specific key
     * @param {String} key
     * @returns The value of the global with specific key
     */
  getGlobal (key) {
    return this.vars[key]
  },

    /**
     * The value of a CONSTANT global with specific constKey
     * @param {String} constKey
     * @returns The value of the CONSTANT global with specific constKey
     */
  getConstant (constKey) {
    return this.consts[constKey]
  }
}

module.exports = globals

},{}],14:[function(require,module,exports){
let BaseItem = require('./baseItem')
let Rectangle = require('./rectangle')
class HealthItem extends BaseItem
{

	constructor(o){

        super(o);
        this.setType(BaseItem.TYPE.HEALTH);
        this.effect = BaseItem.EFFECT.HEALTH;

        this.owner = o.owner || null;
        this.body = new Rectangle(o.x || 0,o.y || 0,this.width,this.height);
        this.usable = true;
        this.used = o.used || false
        this.timestamp = o.timestamp || this.timestamp

    }

    // At the moment allways return 25, means the health to be restored
    use(){

        this.used = true;
        return 25;
    }

	render(){
		
        
		this.gfx.save();
        
        let POS_W = - this.width/2
        let POS_H = - this.height/2
        this.gfx.translate(POS_W,POS_H);
        this.body.render("#fff",true);
		this.gfx.font = "12px FontAwesome";
		this.gfx.fillStyle = "#FF0000";
		this.gfx.fillText('\uf067',this.x-1+this.width/4 , this.y + this.height-12+this.height/2);
		this.gfx.restore();

		return this;
	};

}

module.exports = HealthItem
},{"./baseItem":5,"./rectangle":21}],15:[function(require,module,exports){
'use strict'
var keys = []
exports.debug = false

var keyCodes = {
  SPACE_BAR: 32,

  LEFT_ARROW: 37,
  UP_ARROW: 38,
  RIGHT_ARROW: 39,
  DOWN_ARROW: 40,
  A: 65,
  W: 85,
  S: 83,
  D: 68,
  Q: 81
}
for (var keyName in keyCodes) {
  exports[keyName] = keyCodes[keyName]
}

exports.isKeyDown = function (keyCode) {
  if (typeof keyCode === 'number') return Boolean(keys[keyCode])
  if (typeof keyCode === 'string' && keyCode.length === 1) {
    var letter = keyCode.toUpperCase()
    return Boolean(keys[letter.charCodeAt(0)])
  }
  throw new TypeError(
    '`isKeyDown` expected keyCode (`number`) or character. Got ' + keyCode + '.'
  )
}

document.addEventListener('keydown', function (e) {
  keys[e.keyCode] = true
  if (exports.debug) {
    var letter = String.fromCharCode(e.keyCode)
    console.log('-- keyIsDown ASCII(' + e.keyCode + ') CHAR(' + letter + ')')
  }
})

document.addEventListener('keyup', function (e) {
  keys[e.keyCode] = false
  if (exports.debug) {
    var letter = String.fromCharCode(e.keyCode)
    console.log('-- keyIsUp ASCII(' + e.keyCode + ') CHAR(' + letter + ')')
  }
})
},{}],16:[function(require,module,exports){
const MapChunk = require('./mapChunk')
/**
 * @class {Map} Map
 * @constructor {Map} Map
 */
class Map {

    /**
     * @constructor {Map} Map
     * @param {integer} mapId - A unique Map identifier
     * @param {integer} width - The Map width dimension
     * @param {integer} height - The Map height dimension
     */
  constructor (mapId = 0, width = 0, height = 0) {
  /**
   * Contains the Map chunks. A chunk is a map portion or map cell that can hold GameObjects
   * @member {Object} chunks
   */
    this.chunks = {}
    this.id = mapId;
    this.width = width;
    this.height = height;
    this.MapChunk = MapChunk;
    /**
     * The chunk size as CHUNK_SIZE x CHUNK_SIZE
     * @const {type} name
     */
    this.CHUNK_SIZE = 400
  }

    /**
     * Adds a MapChunk to this map
     * @param {MapChunk} mapChunk - A MapChunk object
     */
  addChunk (mapChunk) {
    this.chunks[mapChunk.id] = mapChunk
    return this
  }

  removeChunk (mapChunkId) {
    delete this.chunks[mapChunkId]
  }

    /**
     * @return {Object} - Return the map chunks
     */
  getChunks () {
    return this.chunks
  }
}

module.exports = Map

},{"./mapChunk":17}],17:[function(require,module,exports){
let Renderable = require("./renderable");
let Rectangle = require("./rectangle");

class MapChunk extends Renderable {

    /**
     * @constructor {MapChunk} - The MapChunk constructor
     * @param {integer} mcId - The MapChunk unique identifier. The identifier must be a coordinate index inside the World
     * @param {integer} x - The X World coordinate at this chunk starts (top left corner)
     * @param {integer} y - The Y World coordinate at this chunk starts (top left corner)
     * @param {integer} width - The MapChunk width dimension
     * @param {integer} height - The MapChunk height dimension
     */
  constructor (mcId, x,y,width = 0, height = 0) {
    super();
    this.x = x;
    this.y = y;
    this.width = width
    this.height = height
    this.gameObjects = {}
    this.id = mcId
    this.background = new Rectangle(x,y,this.width,this.height);
  }

    /**
     * @param {GameObject} gameObject - Adds a gameObject to this MapChunk
     * @return {MapChunk} - Return self instance
     */
  addGameObject (gameObject) {
    this.gameObjects[gameObject.id] = gameObject
    return this
  }

    /**
     * @return {Array} - Returns the GameObjects inside this MapChunk
     */
  getGameObjects () {
    return this.gameObjects
  }

    /**
     * @param {integer} gameObjectId - Remove a gameObject of this MapChunk
     * @return {MapChunk} - Return self instance
     */
  removeGameObject (gameObjectId) {
    delete this.gameObjects[gameObjectId]
    return this
  }

  render(){

    this.background.render("green",true);
    return this;
  }
}

module.exports = MapChunk

},{"./rectangle":21,"./renderable":23}],18:[function(require,module,exports){
// Dead reckoning - Algorithm

// Rocket legue -> Simulation + Redo

// timestamp actual, posicion (x,y), velocidad (vx, vy) e input jugador

// Simular lag con setTimeout
class Network {

  constructor (socketIO,isClient=false) {
    this.ping = Infinity
    this.isClient = isClient // If false => Server else Client
    this.io = !isClient ? socketIO : null
    this.socket = isClient ? socketIO : null
    this.id = isClient ? this.socket.id : null
    this.lastPingTimestamp = 0
    this.pingMessageTimestamp = 0;
    this.PING_HANDSHAKE_INTERVAL = 250
    this.clients = !isClient ? {} : null;
    this.events = {};
  }

  registerNetEvents(oEvents){

    this.events = oEvents;
    return this;
  }

  setPing (p) {
    this.ping = p
    return this
  }

  getPing () {
    return this.ping
  }

  sendPing(){
    if(this.isClient){
      this.pingMessageTimestamp = Date.now()
      this.socket.emit("game:ping",{});
    }
    return this;
  }
  // Register new event to all clients (if we are server) or to us (if we are a client)
  listen (evnt, callback) {

    if(this.isClient){

      this.socket.on(evnt, callback);
    }else{
      for(let c in this.clients){

        this.clients[c].on(evnt, callback);
      }
    }

    return this
  }

  send (evnt, objectData) {

    let args = Array.from(arguments)
    args.splice(0,1)

    if(objectData.constructor !== Object ) objectData = args

    if(this.isClient){
      this.socket.emit.apply(this.socket,[evnt].concat(args))
    }else{

      this.broadcast.apply(this,[evnt].concat(args))
    }
    return this
  }

  // Like send but server broadcast to all
  broadcast(evnt,objectData){

    let args = Array.from(arguments)
    args.splice(0,1)

    if(objectData.constructor !== Object ) objectData = args

    this.io.sockets.emit.apply(this.io.sockets,[evnt].concat(args))
    return this
  }

  getId () {
    return this.id
  }

  init(){

    let $s = this.io;
    let $self = this;
    if(this.isClient){

      // Init socketIO
      this.socket = this.socket()
      $s = this.socket
    }

    if(!$self.isClient){
      $s.on("connect",function($socket){
        console.log('A client has connected with ID: '+$socket.id);
        $self.clients[$socket.id] = $socket;

        // Register the server network events
        for(let ev in $self.events){

          if($self.events.hasOwnProperty(ev)){

            $socket.on(ev,$self.events[ev]);
          }
        }
      })
    }else{
      // Register the client network events
      //console.info('We have connected to the server successfully!')
      for(let ev in $self.events){

        if($self.events.hasOwnProperty(ev)){

          $s.on(ev,$self.events[ev]);
        }
      }
    }

    return this
  }

  startPingHandshake (pingEvnt) {
    this.lastPingTimestamp = Date.now()
    this.socket.emit(pingEvnt)

    setInterval(this.pingHandshake.bind(this, pingEvnt), this.PING_HANDSHAKE_INTERVAL)
  }

  pingHandshake (pingEvnt) {
    this.lastPingTimestamp = Date.now()
    this.socket.emit(pingEvnt)
  }

}

module.exports = Network

},{}],19:[function(require,module,exports){
const GameObject = require('./gameObject')

/**
 * Represents a player of the game
 * @public
 */
class Player extends GameObject {

    constructor(id,x,y,width,height,radius,timestamp,nickname){
        super(id,x,y,width,height,radius)
        this.inputs = {}
        this.color = ""
        this.timestamp = 0 || timestamp
        this.nickname = nickname || ""
        this.bonus = {}
        this.timesDead = 0
        this.score = 0
    }
}

module.exports = Player

},{"./gameObject":12}],20:[function(require,module,exports){
const Renderable = require('./renderable')
class Point extends Renderable
{
  constructor (_x, _y) {
    super()
    this.x = _x
    this.y = _y
  }

  render (size, color) {
    this.gfx.save();
    this.gfx.beginPath()
    this.gfx.arc(this.x, this.y, size, 0, 2 * Math.PI, true)
    this.gfx.fillStyle = color
    this.gfx.fill()
    this.gfx.strokeStyle = color
    this.gfx.stroke()
    this.gfx.restore();
  };
};

module.exports = Point

},{"./renderable":23}],21:[function(require,module,exports){
const Point = require('./point')
const Renderable = require('./renderable')
class Rectangle extends Renderable {
  constructor (x, y, width, height) {
    super()
    this.x = x
    this.y = y
    this.width = width
    this.height = height
  }

  render (color, fill) {
    this.gfx.save()
    
    //let POS_W = - this.width/2
    //let POS_H = - 3/2*this.height
//this.gfx.translate(POS_W,POS_H);
    this.gfx.beginPath()
    this.gfx.rect(this.x, this.y, this.width, this.height)
    this.gfx.strokeStyle = color
    this.gfx.stroke()
    if (fill) {
      this.gfx.fillStyle = color
      this.gfx.fillRect(this.x, this.y, this.width, this.height)
    }
    this.gfx.restore()
  }

  rectInside (rect) {
    if (this.x < rect.x + rect.width && this.x + this.width > rect.x &&
        this.y < rect.y + rect.height && this.y + this.height > rect.y) {
      return true
    }
    return false
  }

  pointInside (px, py) {
    if (arguments.length === 1) {
      var pt = new Point(px.x, px.y)
      px = pt.x
      py = pt.y
    }
    if (px >= this.x && px <= this.x + this.width) {
      if (py >= this.y && py <= this.y + this.height) {
        return true
      }
    }
    return false
  }

  rotate (radians,color,fill) {
    this.gfx.save()
    this.gfx.translate(this.x + this.width / 2, this.y + this.height / 2)
    this.gfx.rotate(radians)
    this.gfx.translate(-this.x - this.width / 2, -this.y - this.height / 2)
    
    this.render(color,fill)
    this.gfx.restore()
    return this
  };

}

module.exports = Rectangle

},{"./point":20,"./renderable":23}],22:[function(require,module,exports){
let globals = require('./globals');
class Render {

    /**
     * Creates an instance of Render.
     *
     * @param {CanvasRenderingContext2D} canvasContext
     *
     * @memberOf Render
     */
  constructor (canvasContext) {
    this.gfx = canvasContext
    
    if(!globals.getGlobal("SERVER")){

      this.layers = {
        world: {},
        camera: {},
        objects:  {}
      } // The layers to identify where the object, world or a camera must be added to be controlled

    }
  }
}

console.log("GLOBALS_OBJ: ",globals)
let render = null;
if(!globals.getGlobal("SERVER")){
  render = new Render(globals.getGlobal('canvas').getContext('2d'))
  module.exports = render.gfx
}else{
  module.exports = null
}
},{"./globals":13}],23:[function(require,module,exports){
const Render = require('./render') // Instance of GFX
let globals = require('./globals');
/**
 * A class that makes an object to be drawn with render method and some other functions.
 * @class Renderable
 */
class Renderable {

  /**
   * Creates an instance of Renderable.
   * @memberOf Renderable
   */
  constructor () {
    if (new.target === Renderable) {
      throw new TypeError('Cannot construct interface instance directly!')
    }
    if (this.render === undefined) {
      throw new TypeError('This class must implement the render method')
    }

    this.gfx = Render
    this.translateX = 0
    this.translateY = 0
  }

}

module.exports = Renderable


},{"./globals":13,"./render":22}],24:[function(require,module,exports){
/* globals window */
const globals = require("./globals");

if(!globals.getGlobal("SERVER")){
  window.int_x = 0
  window.int_y = 0
}


var DONT_INTERSECT = 0
var COLLINEAR = 1
var DO_INTERSECT = 2

const Vector = require('./vector')
const Point = require('./point')

function sameSign (a, b) { return ((a * b) >= 0) }

const Renderable = require('./renderable')
class Segment extends Renderable
{
  constructor (x, y, vecx, vecy, width) {
    super()
    this.x = x
    this.y = y
    this.vecx = vecx
    this.vecy = vecy
    this.width = width
  }

  render (width, color) {
    this.gfx.save()
    this.gfx.beginPath()
    this.gfx.lineWidth = width !== undefined && width !== null ? width : this.width
    this.gfx.moveTo(this.x, this.y)
    this.gfx.lineTo(this.x + this.vecx, this.y + this.vecy)
    this.gfx.strokeStyle = color
    this.gfx.stroke()
    this.gfx.closePath()
    this.gfx.restore()
  };

  rotate (radians) {
    var X = this.vecx * Math.cos(radians) - this.vecy * Math.sin(radians)
    var Y = this.vecy * Math.cos(radians) + this.vecx * Math.sin(radians)

    this.vecx = X
    this.vecy = Y
    return this
  };

  length () {
    var dx = this.vecx
    var dy = this.vecy
    return Math.sqrt(dx * dx + dy * dy)
  }

  normal () {
    var x1 = this.y
    var y1 = this.x + this.vecx
    var y2 = this.x
    var x2 = this.y + this.vecy
    return new Segment(x1, y1, x2 - x1, y2 - y1)
  }

  center () {
    var _x = this.x + this.x + this.vecx
    var _y = this.y + this.y + this.vecy
    _x /= 2
    _y /= 2
    return new Point(_x, _y)
  }

  unit () {
    return new Segment(0, 0, this.vecx / this.length(), this.vecy / this.length())
  }

  multiply (multiplier) {
    return new Segment(0, 0, this.vecx * multiplier, this.vecy * multiplier)
  }

  project (segOnto) {
    var vec = new Vector(this.vecx, this.vecy)
    var onto = new Vector(segOnto.vecx, segOnto.vecy)
    var d = onto.dot(onto)
    if (d > 0) {
      var dp = vec.dot(onto)
      var multiplier = dp / d
      var rx = onto.x * multiplier
      var ry = onto.y * multiplier
      return new Point(rx, ry)
    }
    return new Point(0, 0)
  }

  intersect (segment) {
      // a
    var x1 = this.x
    var y1 = this.y
    var x2 = this.x + this.vecx
    var y2 = this.y + this.vecy

          // b
    var x3 = segment.x
    var y3 = segment.y
    var x4 = segment.x + segment.vecx
    var y4 = segment.y + segment.vecy

    var a1, a2, b1, b2, c1, c2
    var r1, r2, r3, r4
    var denom, offset, num

    a1 = y2 - y1
    b1 = x1 - x2
    c1 = (x2 * y1) - (x1 * y2)

    r3 = ((a1 * x3) + (b1 * y3) + c1)
    r4 = ((a1 * x4) + (b1 * y4) + c1)

    if ((r3 !== 0) && (r4 !== 0) && sameSign(r3, r4)) {
      return DONT_INTERSECT
    }

    a2 = y4 - y3 // Compute a2, b2, c2
    b2 = x3 - x4
    c2 = (x4 * y3) - (x3 * y4)
    r1 = (a2 * x1) + (b2 * y1) + c2 // Compute r1 and r2
    r2 = (a2 * x2) + (b2 * y2) + c2

    if ((r1 !== 0) && (r2 !== 0) && (sameSign(r1, r2))) {
      return DONT_INTERSECT
    }

    denom = (a1 * b2) - (a2 * b1) // Line segments intersect: compute intersection point.

    if (denom === 0) {
      return COLLINEAR
    }

    if (denom < 0) offset = -denom / 2; else offset = denom / 2

    num = (b1 * c2) - (b2 * c1)
    if (num < 0) window.int_x = (num - offset) / denom; else window.int_x = (num + offset) / denom

    num = (a2 * c1) - (a1 * c2)
    if (num < 0) window.int_y = (num - offset) / denom; else window.int_y = (num + offset) / denom

    return DO_INTERSECT
  }

}

module.exports = Segment

},{"./globals":13,"./point":20,"./renderable":23,"./vector":27}],25:[function(require,module,exports){
let globals = require('./globals');
const utils = require('./utils')
const Player = require('./player')
const Segment = require('./segment')
const Rectangle = require('./rectangle')
const BaseProjectile = require('./baseProjectile')


class Tank extends Player
{
  constructor (o) {
    super(o.id, o.x, o.y, o.width, o.height, o.radius, o.timestamp,o.nickname)

    this.health = o.died ? 0 : (o.health ? o.health : 100)
    this.maxHealth = o.maxHealth ? o.maxHealth : 100

    this.died = o.died || false
    this.timesDead = o.timesDead || 0
    this.ammo = o.ammo !== undefined ? o.ammo : 10
    this.maxAmmo = o.maxAmmo || 10
    this.defense = o.defense || 0
    this.carryFlag = o.carryFlag || false
    this.color = o.color;

    this.healthBarOffset = 30
    this.healthBar = new Segment(this.x, this.y - this.healthBarOffset, 40, 0, 5)
    this.maxHealthBarX = this.healthBar.vecx + 2

    this.setHealth(this.health); // refresh the healthbar

        // Unit director vector and shortcut degrees
    this.orientation = {
      x: 1,
      y: 0,
      degree: 0
    }

    this.body = new Rectangle(this.x, this.y, this.width, this.height)
    this.turret = {
      base: new Rectangle(this.x, this.y, this.width / 2, this.height / 2),
      canon: new Segment(this.x + this.width / 2, this.y + this.height / 2, 40, 0, 3),
      orientation: 0 // In degrees
    }

    if(o.turret && o.turret.orientation){

      this.rotateTurret(o.turret.orientation);
    }

        // Speed X
    this.vx = o.vx ? o.vx : 0
        // Speed y
    this.vy = o.vy ? o.vy : 0

    // Speed vector direction
    this.vxDir = o.vxDir || 0; // -1 = left; +1 = right
    this.vyDir = o.vyDir || 0; // -1 = up; +1 = down

    // Acceleration
    this.ax = o.ax ? o.ax : 0
    this.ay = o.ay ? o.ay : 0

    this.maxSpeed = o.maxSpeed || 5 // Default speed
  }

  getId () {
    return this.id
  };

  setSpeed (speed) {
    this.speed = speed
  };

  getSpeed () {
    return this.speed
  };

  setPosition (x, y) {
    this.x = x
    this.y = y

    this.body.x = x
    this.body.y = y

    this.turret.base.x = this.x + this.width / 4
    this.turret.base.y = this.y + this.height / 4

    this.turret.canon.x = this.x + this.width / 2
    this.turret.canon.y = this.y + this.height / 2

    return this
  };

   // Rotate the body of the tank
  rotate (degrees) {
    var rad = utils.degreeToRadian(degrees)
    var X = this.orientation.x * Math.cos(rad) - this.orientation.y * Math.sin(rad)
    var Y = this.orientation.y * Math.cos(rad) + this.orientation.x * Math.sin(rad)

    this.orientation.x = X
    this.orientation.y = Y
    this.orientation.degree += degrees
    this.orientation.degree %= 360
    return this
  };

   // Just move forward into orientation direction
  move () {
    //this.x += this.orientation.x * distance
    //this.y += this.orientation.y * distance

    this.body.x = this.x
    this.turret.base.x = this.x + this.width / 4
    this.turret.canon.x = this.x + this.width / 2

    this.healthBar.x = this.x

    this.body.y = this.y

    this.turret.base.y = this.y + this.width / 4
    this.turret.canon.y = this.y + this.width / 2

    this.healthBar.y = this.y - this.healthBarOffset

    return this
  };

  rotateTurret (degrees) {
    this.turret.orientation += degrees
    this.turret.orientation %= 360
    this.turret.canon.rotate(utils.degreeToRadian(degrees))

    return this
  };

  /**
   * @pre - Assume this tank has ammo
   */
  shoot (strenght) {
    strenght = strenght !== undefined ? strenght : 1.0
    var p = new BaseProjectile({

      id: -1, // The server will asign a new ID
      x: this.turret.canon.x,
      y: this.turret.canon.y,// - this.height/2,
      owner: this.id,
      width: this.turret.canon.width,
      height: this.turret.canon.width,
      radius: this.turret.canon.width,
      damage: 5,
      speed: strenght

    })

    p.translateX = this.width /2;
    p.translateY = this.height /2;
    p.isExplosive = true
    var s = this.turret.canon.unit()
    p.direction = {
      x: s.vecx,
      y: s.vecy
    }
    if(!globals.getGlobal("SERVER")) p.render()
    return p
  }

  setHealth (health) {
    this.health = health
    if (this.health > this.maxHealth) this.health = this.maxHealth
    else if (this.health <= 0) {
      this.died = true
      this.health = 0
    }

    var width = this.health * (this.maxHealthBarX - 2) / this.maxHealth
    this.healthBar.vecx = width
    return !this.died;
  }

  heal (amountHealth) {
    if (Number.isInteger(parseInt(amountHealth))) {
      if(!this.died)
        this.setHealth(this.health + amountHealth)
    } else {
      console.error('Tank::heal: Invalid amountHealth')
    }

    return this
  };

  chargeAmmo(amountAmmo){
    if (Number.isInteger(parseInt(amountAmmo))) {
      this.ammo = this.ammo + amountAmmo;
      if(this.ammo > this.maxAmmo) this.ammo = this.maxAmmo
    } else {
      console.error('Tank::chargeAmmo: Invalid amountAmmo')
    }

    return this
  };

  render () {
      // Draw health bar
    this.drawHealthBar()

    let POS_W = - this.width/2
    let POS_H = - this.height/2
    this.gfx.save();
    this.gfx.translate(POS_W,POS_H);
    
    this.body.rotate(utils.degreeToRadian(this.orientation.degree),"#3A5320",true)
    this.gfx.restore();

    this.gfx.save()
    this.gfx.textAlign = "center"
    this.gfx.fillText(this.nickname, this.x, this.y+this.height/2+5);
    this.gfx.restore()

    this.gfx.translate(-this.turret.base.width,-this.turret.base.height)
    if (this.turret.orientation !== 0 && this.turret.orientation !== 360) {
      var rad = utils.degreeToRadian(this.turret.orientation)
      //this.gfx.translate(0,-this.body.height/4)
      this.turret.base.rotate(rad,this.color,true)
      //this.gfx.translate(-this.body.width/4,-this.body.height/4)
    } else {

      this.turret.base.render(this.color,true)
    }

    
    //this.gfx.translate(this.turret.base.width,this.turret.base.height)
    this.turret.canon.render(null, this.color)
    this.gfx.translate(this.turret.base.width,this.turret.base.height)

    return this
  };

  drawHealthBar () {
    this.gfx.save()
    let POS_W = (-this.maxHealthBarX+2)/2;
    if(this.carryFlag){

      this.gfx.save()
      this.gfx.translate(POS_W-20,0);
      this.gfx.font = "12px FontAwesome";
      this.gfx.fillStyle = "#FF0000"
      this.gfx.fillText('\uf024', this.healthBar.x +1,this.healthBar.y);
      this.gfx.strokeStyle = "#000000"
      this.gfx.strokeText('\uf024', this.healthBar.x +1,this.healthBar.y );
      this.gfx.restore();

    }
    this.gfx.translate(POS_W,0);
    this.gfx.fillStyle = 'black'
    this.gfx.fillRect(this.healthBar.x - 1, this.healthBar.y - 3, this.maxHealthBarX, this.healthBar.width + 1)

    this.healthBar.render(4, 'red')
    this.gfx.restore()
    return this
  };

}
module.exports = Tank

},{"./baseProjectile":6,"./globals":13,"./player":19,"./rectangle":21,"./segment":24,"./utils":26}],26:[function(require,module,exports){
let globals = require("./globals")
let ACCEL = globals.getGlobal("ACCEL");
if(!ACCEL){
  globals.addGlobal("ACCEL",1/1000);
  ACCEL = globals.getGlobal("ACCEL");
}
module.exports = {

  degreeToRadian (d) {
    return Math.PI * d / 180;
  },

  radianToDegree (r) {
    return 180 * r / Math.PI;
  },

  calculatePlayerAcceleration(player){

    let { inputs, vxDir, vyDir } = player
    let ax = 0
    let ay = 0
    console.log("ACCELERATION IS==>",ACCEL);
    if(!ACCEL) throw new Error("A");
    if (inputs.LEFT_ARROW) ax -= ACCEL
    if (inputs.RIGHT_ARROW) ax += ACCEL
    if (inputs.UP_ARROW) ay -= ACCEL
    if (inputs.DOWN_ARROW) ay += ACCEL

    player.ax = ax
    player.ay = ay

    player.vxDir = vxDir
    player.vyDir = vyDir
  }

}

},{"./globals":13}],27:[function(require,module,exports){
const Renderable = require('./renderable')
class Vector extends Renderable
{
  constructor (_x, _y) {
    super()
    this.x = _x
    this.y = _y
  }

  render (size, color) {
    this.gfx.save()
    this.gfx.beginPath()
    this.gfx.arc(this.x, this.y, size, 0, 2 * Math.PI, true)
    this.gfx.fillStyle = color
    this.gfx.fill()
    this.gfx.strokeStyle = color
    this.gfx.stroke()
    this.gfx.restore()
  };

  add (vector) {
    var v = new Vector(this.x += vector.x, this.y += vector.y)
    return v
  };

  subtract (vector) {
    var v = new Vector(this.x -= vector.x, this.y -= vector.y)
    return v
  };

  multiply (multiplier) {
    var v = new Vector(this.x *= multiplier, this.y *= multiplier)
    return v
  };

   // Modulus
  length () {
    return Math.sqrt(this.x * this.x + this.y * this.y)
  };

   // Cross product
  cross (vector) {
    return this.x * vector.y - this.y * vector.x
  };

   // Dot product
  dot (vector) {
    return this.x * vector.x + this.y * vector.y
  }
};

module.exports = Vector

},{"./renderable":23}]},{},[9]);
