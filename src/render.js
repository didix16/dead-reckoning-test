let globals = require('./globals');
class Render {

    /**
     * Creates an instance of Render.
     *
     * @param {CanvasRenderingContext2D} canvasContext
     *
     * @memberOf Render
     */
  constructor (canvasContext) {
    this.gfx = canvasContext
    
    if(!globals.getGlobal("SERVER")){

      this.layers = {
        world: {},
        camera: {},
        objects:  {}
      } // The layers to identify where the object, world or a camera must be added to be controlled

    }
  }
}

console.log("GLOBALS_OBJ: ",globals)
let render = null;
if(!globals.getGlobal("SERVER")){
  render = new Render(globals.getGlobal('canvas').getContext('2d'))
  module.exports = render.gfx
}else{
  module.exports = null
}