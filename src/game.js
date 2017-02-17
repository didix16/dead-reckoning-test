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
