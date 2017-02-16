const Renderable = require('./renderable')

/**
 * Represents a in-game object in 2D. Has a x,y width and height
 * @public
 * @constructor {GameObject} GameObject
 * @class {GameObject} GameObject
 */
class GameObject extends Renderable {

    /**
     * @func constructor
     * @param {integer} id - The unique identifier of this GameObject
     * @param {integer} x - The initial X object coordinate position
     * @param {integer} y - The initial X object coordinate position
     * @param {integer} width - The width of the object
     * @param {integer} height - The height of the object
     * @param {integer} radius - The radius of the object
     */
  constructor (id = 0, x = 0, y = 0, width = 0, height = 0, radius = 0) {
    super()
    this.id = id
    this.x = x
    this.y = y
    this.width = width
    this.height = height
    this.radius = radius
    this.center = {
      x: this.x + this.width / 2,
      y: this.y + this.height / 2
    }

        // Initial speed at 0
    this.vx = 0
    this.vy = 0
  }

    /**
     * Set the position of the object in the world
     * @public
     * @param {integer} x - The new X coordinate
     * @param {integer} y - The new Y coordinate
     * @return {GameObject} - Return self instance for chaining
     */
  setPosition (x, y) {
    this.x = x
    this.y = y
    return this
  }

    /**
     * Set the speed of the object in the world
     * @public
     * @param {double} sx - Speed X value
     * @param {double} sy - Speed Y value
     * @return {GameObject} - Return self instance for chaining
     */
  setSpeed (sx, sy) {
    this.vx = sx
    this.vy = sy
    return this
  }

    /**
     * Get the current position of the object in the world
     * @public
     * @return {PlainObject} - A plain object with x and y keys identifying the object position
     */
  getPosition () {
    return {x: this.x, y: this.y}
  }

    /**
     * Set the width of this object
     * @public
     * @param {integer} width - The new width of the object
     * @return {GameObject} - Return self instance for chaining
     */
  setWidth (width) {
    this.width = width
    this.center.x = this.x + this.width / 2
    return this
  }

    /**
     * Set the height of this object
     * @public
     * @param {integer} height - The new height of the object
     * @return {GameObject} - Return self instance for chaining
     */
  setHeight (height) {
    this.height = height
    this.center.y = this.y + this.width / 2
    return this
  }

    /**
     * @public
     * @return {PlainObject} - Return a plain object with x and y keys identifying the GameObject center coordinates
     */
  getCenter () {
    return this.center
  }

    /**
     * @public
     * @return {integer} - Returns the self radius. This number will be > 0. If, means this GameObject is not propertly initialized
     */
  getRadius () {
    return this.radius
  }

    /**
     * Check if this object collides with another
     * @public
     * @param {GameObject} object - The GameObject to check if this collide with it
     * @return {boolean} - Return true if this GameObject collides with object, else return false
     */
  collidesWith (object) {
        // Just check the circular collision
    let center = this.getCenter()
    let oCenter = object.getCenter()

        // Calc Manhattan distance: Check at google
    let distX = Math.abs(center.x - oCenter.x)
    let distY = Math.abs(center.y - oCenter.y)

    let radiusSum = this.getRadius() + object.getRadius()

    return (radiusSum >= distX || radiusSum >= distY)
  }

    /**
     * A method that each GameObject must be implemented for self rendering in the GameWorld.
     * @public
     * @return {GameObject} - Return self instance for chaining
     */
  render () {

    return this
  }
}

module.exports = GameObject
