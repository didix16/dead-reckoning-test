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
