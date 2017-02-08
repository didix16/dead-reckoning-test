const Renderable = require('./render')
/**
 * @ Represents the whole game world with dimension width x height
 * @public
 * @param {integer} width - The width of the GameWorld
 * @param {integer} height - The height of the GameWorld
 * @constructor {GameWorld} GameWorld
 */
class GameWorld extends Renderable {

  constructor (width, height) {
    super()
    this.width = width
    this.height = height
  }

    /**
     * Render the GameWorld
     * @public
     * @return {GameWorld} - Return self reference for chaining
     */
  render () {
    return this
  }
}

module.exports = GameWorld
