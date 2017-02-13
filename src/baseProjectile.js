const GameObject = require('./gameObject')
const Circle = require('./circle')
class BaseProjectile extends GameObject
{

  constructor (o) {
    super(o.id, o.x, o.y, o.width, o.height, o.radius)

    this.owner = 0 // player id

    this.body = new Circle(this.x, this.y, this.radius)
    this.dammage = o.damage

    this.isExplosive = false

    this.direction = {
      x: 0,
      y: 0
    }

        /* this.speed = {
            x: 0,
            y: 0
        }; */

    this.speed = 0.0
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
    this.body.render('#fff', true)
    return this
  }

}

module.exports = BaseProjectile
