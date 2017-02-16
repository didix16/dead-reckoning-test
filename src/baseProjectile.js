const GameObject = require('./gameObject')
const Circle = require('./circle')
class BaseProjectile extends GameObject
{

  constructor (o) {
    super(o.id, o.x, o.y, o.width, o.height, o.radius)

    this.owner = o.owner || 0 // player id

    this.body = new Circle(this.x, this.y, this.radius)
    this.dammage = o.damage

    this.isExplosive = false

    this.timestamp = o.timestamp || 0
    this.translateX = o.translateX || this.translateX
    this.translateY = o.translateY || this.translateY

    this.direction = o.direction || {
      x: 0,
      y: 0
    }

        /* this.speed = {
            x: 0,
            y: 0
        }; */

    this.speed = o.speed || 0.0

    // The distance since was fired
    this.distance = o.distance || 0
    this.MAX_DISTANCE = 1000
  }

  getId () {
    return this.id
  };

  setPosition (x, y) {
    this.x = x
    this.y = y

    this.body.x = x
    this.body.y = y

    return this
  };

  hitsWith (posX, posY) {

  };

  destroy () {
    delete this
  };

  render () {

    this.gfx.translate(-this.translateX,-this.translateY)
    this.body.render('#fff', true)
    this.gfx.translate(this.translateX,this.translateY)
    return this
  }

}

module.exports = BaseProjectile
