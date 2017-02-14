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
  }

}

module.exports = Renderable

