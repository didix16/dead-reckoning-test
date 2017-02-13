const Render = require('./render') // Instance of GFX
let globals = require('./globals');
/**
 * A class that makes an object to be drawn with render method and some other functions.
 * @class Renderable
 */
class Renderable {

  /**
   * Creates an instance of Renderable.
   * @memberOf Renderable
   */
  constructor () {
    if (new.target === Renderable) {
      throw new TypeError('Cannot construct interface instance directly!')
    }
    if (this.render === undefined) {
      throw new TypeError('This class must implement the render method')
    }

    this.gfx = Render
    if(!globals.getGlobal("SERVER")){

      this.layers = {
        world: {},
        camera: {},
        objects:  {}
      } // The layers to identify where the object, world or a camera must be added to be controlled

    }
  }

   renderAll() {

    // Add first layer
    this.gfx.save()

    // Move camera
    this.layers.camera.render()

    // Render world
    this.layers.world.render()

    this.gfx.save()
    // Render objects

    this.layers.objects.render()

    // Restore the World layer
    this.world.restore()

    // Restore to base layer
    this.restore()

  }

}

module.exports = Renderable

