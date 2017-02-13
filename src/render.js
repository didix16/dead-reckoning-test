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
  }
}

console.log("GLOBALS_OBJ: ",globals);
let render = null;
if(!globals.getGlobal("SERVER")){
  render = new Render(globals.getGlobal('canvas').getContext('2d'))
  module.exports = render.gfx
}else{
  module.exports = null
}