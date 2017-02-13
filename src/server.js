const express = require('express')
var app = express()
var http = require('http').Server(app)
var io = require('socket.io')(http)
var GameServer = require('./gameServer')

// Middleware

app.use(function (req, res, next) {
  //  console.log(arguments)
  next()
})

app.use(express.static('public'))

const $game = new GameServer(io)

$game.run(20)

http.listen(process.env.PORT || 3000, function () {
  console.log('listening on *:3000')
})
