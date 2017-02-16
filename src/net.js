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
