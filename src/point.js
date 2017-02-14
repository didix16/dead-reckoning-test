const Renderable = require('./renderable')
class Point extends Renderable
{
  constructor (_x, _y) {
    super()
    this.x = _x
    this.y = _y
  }

  render (size, color) {
    this.gfx.save();
    this.gfx.beginPath()
    this.gfx.arc(this.x, this.y, size, 0, 2 * Math.PI, true)
    this.gfx.fillStyle = color
    this.gfx.fill()
    this.gfx.strokeStyle = color
    this.gfx.stroke()
    this.gfx.restore();
  };
};

module.exports = Point
