const Map = require('./map')
/**
 * @ Represents the whole game world with dimension width x height
 * @public
 * @param {integer} width - The width of the GameWorld
 * @param {integer} height - The height of the GameWorld
 * @constructor {GameWorld} GameWorld
 */
class GameWorld {

  /**
   * @constructor {GameWorld} - Constructs a 2D GameWorld given a width and height dimension
   * @param {integer} width - The width of the GameWorld
   * @param {integer} height - The height of the GameWorld
   */
  constructor (width, height) {
    this.map = new Map(0, width, height)
  }
}

module.exports = GameWorld
