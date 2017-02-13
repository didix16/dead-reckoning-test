const GameObject = require('./gameObject')
const Render = require('./render')
/**
 * A camera that foucus the scene in some part of the game world
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
  }

    /**
     * Centers the camera to the object
     * @function GameCamera.focusOn
     * @param {GameObject} object - A GameObject to be focused on
     * @return {GameCamera} - Return a self reference for chaining
     */
  focusOn (object) {
    Render.gfx.save()
    this.x = object.x - this.width / 2
    this.y = object.y - this.height / 2

    Render.gfx.translate(this.x, this.y)
    Render.gfx.restore()
    return this
  }
}

module.exports = GameCamera
