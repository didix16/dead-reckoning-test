const Renderable = require('./renderable')
class Vector extends Renderable
{
  constructor (_x, _y) {
    super()
    this.x = _x
    this.y = _y
  }

  render (size, color) {
    this.gfx.beginPath()
    this.gfx.arc(this.x, this.y, size, 0, 2 * Math.PI, true)
    this.gfx.fillStyle = color
    this.gfx.fill()
    this.gfx.strokeStyle = color
    this.gfx.stroke()
  };

  add (vector) {
    var v = new Vector(this.x += vector.x, this.y += vector.y)
    return v
  };

  subtract (vector) {
    var v = new Vector(this.x -= vector.x, this.y -= vector.y)
    return v
  };

  multiply (multiplier) {
    var v = new Vector(this.x *= multiplier, this.y *= multiplier)
    return v
  };

   // Modulus
  length () {
    return Math.sqrt(this.x * this.x + this.y * this.y)
  };

   // Cross product
  cross (vector) {
    return this.x * vector.y - this.y * vector.x
  };

   // Dot product
  dot (vector) {
    return this.x * vector.x + this.y * vector.y
  }
};

module.exports = Vector
