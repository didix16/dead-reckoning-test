let globals = require('./globals');
const utils = require('./utils')
const Player = require('./player')
const Segment = require('./segment')
const Rectangle = require('./rectangle')
const BaseProjectile = require('./baseProjectile')


class Tank extends Player
{
  constructor (o) {
    super(o.id, o.x, o.y, o.width, o.height, o.radius, o.timestamp,o.nickname)

    this.health = o.health ? o.health : 100
    this.maxHealth = o.maxHealth ? o.maxHealth : 100
    this.died = o.died || false
    this.ammo = o.ammo !== undefined ? o.ammo : 10
    this.maxAmmo = o.maxAmmo || 10
    this.defense = o.defense || 0
    this.carryFlag = o.carryFlag || false
    this.color = o.color;

    this.healthBarOffset = 30
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
      base: new Rectangle(this.x, this.y, this.width / 2, this.height / 2),
      canon: new Segment(this.x + this.width / 2, this.y + this.height / 2, 40, 0, 3),
      orientation: 0 // In degrees
    }

    if(o.turret && o.turret.orientation){

      this.rotateTurret(o.turret.orientation);
    }

        // Speed X
    this.vx = o.vx ? o.vx : 0
        // Speed y
    this.vy = o.vy ? o.vy : 0

    // Speed vector direction
    this.vxDir = o.vxDir || 0; // -1 = left; +1 = right
    this.vyDir = o.vyDir || 0; // -1 = up; +1 = down

    // Acceleration
    this.ax = o.ax ? o.ax : 0
    this.ay = o.ay ? o.ay : 0

    this.maxSpeed = o.maxSpeed || 5 // Default speed
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
  move () {
    //this.x += this.orientation.x * distance
    //this.y += this.orientation.y * distance

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

  /**
   * @pre - Assume this tank has ammo
   */
  shoot (strenght) {
    strenght = strenght !== undefined ? strenght : 1.0
    var p = new BaseProjectile({

      id: -1, // The server will asign a new ID
      x: this.turret.canon.x,
      y: this.turret.canon.y,// - this.height/2,
      owner: this.id,
      width: this.turret.canon.width,
      height: this.turret.canon.width,
      radius: this.turret.canon.width,
      damage: 5,
      speed: strenght

    })

    p.translateX = this.width /2;
    p.translateY = this.height /2;
    p.isExplosive = true
    var s = this.turret.canon.unit()
    p.direction = {
      x: s.vecx,
      y: s.vecy
    }
    if(!globals.getGlobal("SERVER")) p.render()
    return p
  }

  setHealth (health) {
    this.health = health
    if (this.health > this.maxHealth) this.health = this.maxHealth
    else if (this.health <= 0) {
      this.died = true
      this.health = 0
    }

    var width = this.health * (this.maxHealthBarX - 2) / this.maxHealth
    this.healthBar.vecx = width
    return this.died;
  }

  heal (amountHealth) {
    if (Number.isInteger(parseInt(amountHealth))) {
      if(!this.died)
        this.setHealth(this.health + amountHealth)
    } else {
      console.error('Tank::heal: Invalid amountHealth')
    }

    return this
  };

  chargeAmmo(amountAmmo){
    if (Number.isInteger(parseInt(amountAmmo))) {
      this.ammo = this.ammo + amountAmmo;
      if(this.ammo > this.maxAmmo) this.ammo = this.maxAmmo
    } else {
      console.error('Tank::chargeAmmo: Invalid amountAmmo')
    }

    return this
  };

  render () {
      // Draw health bar
    this.drawHealthBar()

    let POS_W = - this.width/2
    let POS_H = - this.height/2
    this.gfx.save();
    this.gfx.translate(POS_W,POS_H);
    
    this.body.rotate(utils.degreeToRadian(this.orientation.degree),"#3A5320",true)
    this.gfx.restore();

    this.gfx.translate(-this.turret.base.width,-this.turret.base.height)
    if (this.turret.orientation !== 0 && this.turret.orientation !== 360) {
      var rad = utils.degreeToRadian(this.turret.orientation)
      //this.gfx.translate(0,-this.body.height/4)
      this.turret.base.rotate(rad,this.color,true)
      //this.gfx.translate(-this.body.width/4,-this.body.height/4)
    } else {

      this.turret.base.render(this.color,true)
    }

    
    //this.gfx.translate(this.turret.base.width,this.turret.base.height)
    this.turret.canon.render(null, this.color)
    this.gfx.translate(this.turret.base.width,this.turret.base.height)

    return this
  };

  drawHealthBar () {
    this.gfx.save()
    let POS_W = (-this.maxHealthBarX+2)/2;
    /*if(this.carryFlag){

      this.gfx.save()
      this.gfx.translate(POS_W-20,0);
      this.gfx.font = "12px FontAwesome";
      this.gfx.fillStyle = "#FF0000"
      this.gfx.fillText('\uf024', this.healthBar.x +1,this.healthBar.y);
      this.gfx.strokeStyle = "#000000"
      this.gfx.strokeText('\uf024', this.healthBar.x +1,this.healthBar.y );
      this.gfx.restore();

    }*/
    this.gfx.translate(POS_W,0);
    this.gfx.fillStyle = 'black'
    this.gfx.fillRect(this.healthBar.x - 1, this.healthBar.y - 3, this.maxHealthBarX, this.healthBar.width + 1)

    this.healthBar.render(4, 'red')
    this.gfx.restore()
    return this
  };

}

module.exports = Tank
