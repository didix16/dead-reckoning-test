const Point = require('./point')
const Renderable = require('./renderable')
class Rectangle extends Renderable {
  constructor (x, y, width, height) {
    super()
    this.x = x
    this.y = y
    this.width = width
    this.height = height
  }

  render (color, fill) {
    this.gfx.save()
    
    //let POS_W = - this.width/2
    //let POS_H = - 3/2*this.height
//this.gfx.translate(POS_W,POS_H);
    this.gfx.beginPath()
    this.gfx.rect(this.x, this.y, this.width, this.height)
    this.gfx.strokeStyle = color
    this.gfx.stroke()
    if (fill) {
      this.gfx.fillStyle = color
      this.gfx.fillRect(this.x, this.y, this.width, this.height)
    }
    this.gfx.restore()
  }

  rectInside (rect) {
    if (this.x < rect.x + rect.width && this.x + this.width > rect.x &&
        this.y < rect.y + rect.height && this.y + this.height > rect.y) {
      return true
    }
    return false
  }

  pointInside (px, py) {
    if (arguments.length === 1) {
      var pt = new Point(px.x, px.y)
      px = pt.x
      py = pt.y
    }
    if (px >= this.x && px <= this.x + this.width) {
      if (py >= this.y && py <= this.y + this.height) {
        return true
      }
    }
    return false
  }

  rotate (radians,color,fill) {
    this.gfx.save()
    let POS_W = - this.width/2
    let POS_H = - 3/2*this.height
    this.gfx.translate(POS_W,POS_H);
    this.gfx.translate(this.x + this.width / 2, this.y + this.height / 2)
    this.gfx.rotate(radians)
    this.gfx.translate(-this.x - this.width / 2, -this.y + this.height / 2)
    
    this.render(color,fill)
    this.gfx.restore()
    return this
  };

}

module.exports = Rectangle
