(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict'
var keys = []
exports.debug = false

var keyCodes = {
  SPACE_BAR: 32,

  LEFT_ARROW: 37,
  UP_ARROW: 38,
  RIGHT_ARROW: 39,
  DOWN_ARROW: 40
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

},{}],2:[function(require,module,exports){
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

},{"./lib/is_arguments.js":3,"./lib/keys.js":4}],3:[function(require,module,exports){
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

},{}],4:[function(require,module,exports){
exports = module.exports = typeof Object.keys === 'function'
  ? Object.keys : shim;

exports.shim = shim;
function shim (obj) {
  var keys = [];
  for (var key in obj) keys.push(key);
  return keys;
}

},{}],5:[function(require,module,exports){
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

const ACCEL = 1 / 1000

class GameClient {

  constructor () {
    this.players = {}
  }

  onWorldInit (serverPlayers) {
    this.players = serverPlayers
  }

  onPlayerMoved (player) {
    console.log(player)
    this.players[player.id] = player

    const delta = (Date.now() + clockDiff) - player.timestamp

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

        // update our local player' inputs so that we see instant change
        // (inputs get taken into account in logic simulation)
    const myPlayer = game.players[myPlayerId]
    myPlayer.inputs = Object.assign({}, myInputs)
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

  for (let playerId in game.players) {
    const { color, x, y } = game.players[playerId]
    ctx.fillStyle = color
    ctx.fillRect(x, y, 50, 50)
    if (playerId === myPlayerId) {
      ctx.strokeRect(x, y, 50, 50)
    }
  }
}

let past = Date.now()
function gameLoop () {
  requestAnimationFrame(gameLoop)
  const now = Date.now()
  const delta = now - past
  past = now
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

  'world:init': function (serverPlayers, myId) {
    game.onWorldInit(serverPlayers)
    myPlayerId = myId
  },

  playerMoved: game.onPlayerMoved.bind(game),
  playerDisconnected: game.onPlayerDisconnected.bind(game),

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

},{"@dasilvacontin/keyboard":1,"deep-equal":2}]},{},[5]);
