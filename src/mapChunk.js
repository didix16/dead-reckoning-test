class MapChunk {

    /**
     * @constructor {MapChunk} - The MapChunk constructor
     * @param {integer} mcId - The MapChunk unique identifier. The identifier must be a coordinate index inside the World
     * @param {integer} width - The MapChunk width dimension
     * @param {integer} height - The MapChunk height dimension
     */
  constructor (mcId, width = 0, height = 0) {
    this.width = width
    this.height = height
    this.gameObjects = {}
    this.id = mcId
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
}

module.exports = MapChunk
