const Renderable = require('./renderable')
class Circle extends Renderable
{
  constructor (x, y, r) {
    super()
    this.x = x
    this.y = y
    this.radius = r
    this.scale = 1.0
  }

  setScale (s) {
    this.scale = s
    return this
  };

  render (color, fill) {
    this.gfx.save();
    this.gfx.beginPath()
    this.gfx.arc(this.x, this.y, this.radius * this.scale, 0, 2 * Math.PI)
    this.gfx.strokeStyle = color
    this.gfx.stroke()
    if (fill) {
      this.gfx.fillStyle = color
      this.gfx.fill()
    }
    this.gfx.restore();
  };
}

module.exports = Circle
