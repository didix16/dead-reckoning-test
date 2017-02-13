const utils = require('./utils')
const Player = require('./player')
const Segment = require('./segment')
const Rectangle = require('./rectangle')
const BaseProjectile = require('./baseProjectile')

class Tank extends Player
{
  constructor (o) {
    super(o.id, o.x, o.y, o.width, o.height, o.radius)

    this.health = o.health ? o.health : 100
    this.maxHealth = o.maxHealth ? o.maxHealth : 100
    this.died = false

    this.healthBarOffset = 20
    this.healthBar = new Segment(this.x, this.y - this.healthBarOffset, 40, 0, 5)
    this.maxHealthBarX = this.healthBar.vecx + 2

        // Unit director vector and shortcut degrees
    this.orientation = {
      x: 1,
      y: 0,
      degree: 0
    }

    this.body = new Rectangle(this.x, this.y, this.width, this.height)
    this.turret = {
      base: new Rectangle(this.x + this.width / 4, this.y + this.height / 4, this.width / 2, this.height / 2),
      canon: new Segment(this.x + this.width / 2, this.y + this.height / 2, 40, 0, 3),
      orientation: 0 // In degrees
    }

        // Speed X
    this.sx = 0
        // Speed y
    this.sy = 0

    this.speed = 20 // Default speed
  }

  getId () {
    return this.id
  };

  setSpeed (speed) {
    this.speed = speed
  };

  getSpeed () {
    return this.speed
  };

  setPosition (x, y) {
    this.x = x
    this.y = y

    this.body.x = x
    this.body.y = y

    this.turret.base.x = this.x + this.width / 4
    this.turret.base.y = this.y + this.height / 4

    this.turret.canon.x = this.x + this.width / 2
    this.turret.canon.y = this.y + this.height / 2

    return this
  };

   // Rotate the body of the tank
  rotate (degrees) {
    var rad = utils.degreeToRadian(degrees)
    var X = this.orientation.x * Math.cos(rad) - this.orientation.y * Math.sin(rad)
    var Y = this.orientation.y * Math.cos(rad) + this.orientation.x * Math.sin(rad)

    this.orientation.x = X
    this.orientation.y = Y
    this.orientation.degree += degrees
    this.orientation.degree %= 360
    return this
  };

   // Just move forward into orientation direction
  move (distance) {
    this.x += this.orientation.x * distance
    this.y += this.orientation.y * distance

    this.body.x = this.x
    this.turret.base.x = this.x + this.width / 4
    this.turret.canon.x = this.x + this.width / 2

    this.healthBar.x = this.x

    this.body.y = this.y

    this.turret.base.y = this.y + this.width / 4
    this.turret.canon.y = this.y + this.width / 2

    this.healthBar.y = this.y - this.healthBarOffset

    return this
  };

  rotateTurret (degrees) {
    this.turret.orientation += degrees
    this.turret.orientation %= 360
    this.turret.canon.rotate(utils.degreeToRadian(degrees))

    return this
  };

  shoot (strenght) {
    strenght = strenght !== undefined ? strenght : 1.0
    var p = new BaseProjectile({

      id: this.id,
      x: this.turret.canon.x + this.turret.canon.vecx,
      y: this.turret.canon.y + this.turret.canon.vecy,
      owner: this.owner,
      width: this.turret.canon.width,
      height: this.turret.canon.width,
      radius: this.turret.canon.width,
      damage: 20,
      speed: strenght

    })

    p.isExplosive = true
    var s = this.turret.canon.unit()
    p.direction = {
      x: s.vecx,
      y: s.vecy
    }
    p.render()
    return p
  }

  setHealth (health) {
    this.health = health
    if (this.health > this.maxHealth) this.health = this.maxHealth
    else if (this.health <= 0) {
      this.died = 0
      this.health = 0
    }

    var width = this.health * (this.maxHealthBarX - 2) / this.maxHealth
    this.healthBar.vecx = width
  }

  heal (amountHealth) {
    if (Number.isInteger(parseInt(amountHealth))) {
      this.setHealth(this.health + amountHealth)
    } else {
      console.error('Tank::heal: Invalid amountHealth')
    }

    return this
  };

  render () {
      // Draw health bar
    this.drawHealthBar()

    this.body.rotate(utils.degreeToRadian(this.orientation.degree))

    if (this.turret.orientation !== 0 && this.turret.orientation !== 360) {
      var rad = utils.degreeToRadian(this.turret.orientation)
      this.turret.base.rotate(rad)
    } else {

      this.turret.base.render('#f00')
    }

    this.turret.canon.render(null, '#f00')

    return this
  };

  drawHealthBar () {
    this.gfx.save()
    let POS_W = - this.healthBar.vecx/2
    let POS_H = - this.healthBar.vecy/2
    this.gfx.translate(POS_W,POS_H);
    this.gfx.fillStyle = 'black'
    this.gfx.fillRect(this.healthBar.x - 1, this.healthBar.y - 3, this.maxHealthBarX, this.healthBar.width + 1)
    this.gfx.restore()
    this.healthBar.render(4, 'red')
    return this
  };

}

module.exports = Tank