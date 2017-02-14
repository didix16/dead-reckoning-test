/* globals window */
const globals = require("./globals");

if(!globals.getGlobal("SERVER")){
  window.int_x = 0
  window.int_y = 0
}


var DONT_INTERSECT = 0
var COLLINEAR = 1
var DO_INTERSECT = 2

const Vector = require('./vector')
const Point = require('./point')

function sameSign (a, b) { return ((a * b) >= 0) }

const Renderable = require('./renderable')
class Segment extends Renderable
{
  constructor (x, y, vecx, vecy, width) {
    super()
    this.x = x
    this.y = y
    this.vecx = vecx
    this.vecy = vecy
    this.width = width
  }

  render (width, color) {
    this.gfx.save()
    this.gfx.beginPath()
    this.gfx.lineWidth = width !== undefined && width !== null ? width : this.width
    this.gfx.moveTo(this.x, this.y)
    this.gfx.lineTo(this.x + this.vecx, this.y + this.vecy)
    this.gfx.strokeStyle = color
    this.gfx.stroke()
    this.gfx.closePath()
    this.gfx.restore()
  };

  rotate (radians) {
    var X = this.vecx * Math.cos(radians) - this.vecy * Math.sin(radians)
    var Y = this.vecy * Math.cos(radians) + this.vecx * Math.sin(radians)

    this.vecx = X
    this.vecy = Y
    return this
  };

  length () {
    var dx = this.vecx
    var dy = this.vecy
    return Math.sqrt(dx * dx + dy * dy)
  }

  normal () {
    var x1 = this.y
    var y1 = this.x + this.vecx
    var y2 = this.x
    var x2 = this.y + this.vecy
    return new Segment(x1, y1, x2 - x1, y2 - y1)
  }

  center () {
    var _x = this.x + this.x + this.vecx
    var _y = this.y + this.y + this.vecy
    _x /= 2
    _y /= 2
    return new Point(_x, _y)
  }

  unit () {
    return new Segment(0, 0, this.vecx / this.length(), this.vecy / this.length())
  }

  multiply (multiplier) {
    return new Segment(0, 0, this.vecx * multiplier, this.vecy * multiplier)
  }

  project (segOnto) {
    var vec = new Vector(this.vecx, this.vecy)
    var onto = new Vector(segOnto.vecx, segOnto.vecy)
    var d = onto.dot(onto)
    if (d > 0) {
      var dp = vec.dot(onto)
      var multiplier = dp / d
      var rx = onto.x * multiplier
      var ry = onto.y * multiplier
      return new Point(rx, ry)
    }
    return new Point(0, 0)
  }

  intersect (segment) {
      // a
    var x1 = this.x
    var y1 = this.y
    var x2 = this.x + this.vecx
    var y2 = this.y + this.vecy

          // b
    var x3 = segment.x
    var y3 = segment.y
    var x4 = segment.x + segment.vecx
    var y4 = segment.y + segment.vecy

    var a1, a2, b1, b2, c1, c2
    var r1, r2, r3, r4
    var denom, offset, num

    a1 = y2 - y1
    b1 = x1 - x2
    c1 = (x2 * y1) - (x1 * y2)

    r3 = ((a1 * x3) + (b1 * y3) + c1)
    r4 = ((a1 * x4) + (b1 * y4) + c1)

    if ((r3 !== 0) && (r4 !== 0) && sameSign(r3, r4)) {
      return DONT_INTERSECT
    }

    a2 = y4 - y3 // Compute a2, b2, c2
    b2 = x3 - x4
    c2 = (x4 * y3) - (x3 * y4)
    r1 = (a2 * x1) + (b2 * y1) + c2 // Compute r1 and r2
    r2 = (a2 * x2) + (b2 * y2) + c2

    if ((r1 !== 0) && (r2 !== 0) && (sameSign(r1, r2))) {
      return DONT_INTERSECT
    }

    denom = (a1 * b2) - (a2 * b1) // Line segments intersect: compute intersection point.

    if (denom === 0) {
      return COLLINEAR
    }

    if (denom < 0) offset = -denom / 2; else offset = denom / 2

    num = (b1 * c2) - (b2 * c1)
    if (num < 0) window.int_x = (num - offset) / denom; else window.int_x = (num + offset) / denom

    num = (a2 * c1) - (a1 * c2)
    if (num < 0) window.int_y = (num - offset) / denom; else window.int_y = (num + offset) / denom

    return DO_INTERSECT
  }

}

module.exports = Segment
