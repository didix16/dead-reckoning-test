
let Renderable = require("./renderable");
let Rectangle = require("./rectangle");

class MapChunk extends Renderable {

    /**
     * @constructor {MapChunk} - The MapChunk constructor
     * @param {integer} mcId - The MapChunk unique identifier. The identifier must be a coordinate index inside the World
     * @param {integer} x - The X World coordinate at this chunk starts (top left corner)
     * @param {integer} y - The Y World coordinate at this chunk starts (top left corner)
     * @param {integer} width - The MapChunk width dimension
     * @param {integer} height - The MapChunk height dimension
     */
  constructor (mcId, x,y,width = 0, height = 0) {
    super();
    this.x = x;
    this.y = y;
    this.width = width
    this.height = height
    this.gameObjects = {}
    this.id = mcId
    this.background = new Rectangle(x,y,this.width,this.height);
  }

    /**
     * @param {GameObject} gameObject - Adds a gameObject to this MapChunk
     * @return {MapChunk} - Return self instance
     */
  addGameObject (gameObject) {
    this.gameObjects[gameObject.id] = gameObject
    return this
  }

    /**
     * @return {Array} - Returns the GameObjects inside this MapChunk
     */
  getGameObjects () {
    return this.gameObjects
  }

    /**
     * @param {integer} gameObjectId - Remove a gameObject of this MapChunk
     * @return {MapChunk} - Return self instance
     */
  removeGameObject (gameObjectId) {
    delete this.gameObjects[gameObjectId]
    return this
  }

  render(){

    this.background.render("green",true);
    return this;
  }
}

module.exports = MapChunk
