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
