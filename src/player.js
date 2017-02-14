const GameObject = require('./gameObject')

/**
 * Represents a player of the game
 * @public
 */
class Player extends GameObject {

    constructor(id,x,y,width,height,radius,timestamp){
        super(id,x,y,width,height,radius)
        this.inputs = {}
        this.color = ""
        this.timestamp = 0 || timestamp
    }
}

module.exports = Player
