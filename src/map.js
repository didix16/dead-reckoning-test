const MapChunk = require('./mapChunk')
/**
 * @class {Map} Map
 * @constructor {Map} Map
 */
class Map {

    /**
     * @constructor {Map} Map
     * @param {integer} mapId - A unique Map identifier
     * @param {integer} width - The Map width dimension
     * @param {integer} height - The Map height dimension
     */
  constructor (mapId = 0, width = 0, height = 0) {
  /**
   * Contains the Map chunks. A chunk is a map portion or map cell that can hold GameObjects
   * @member {Object} chunks
   */
    this.chunks = {}
    this.id = mapId;
    this.width = width;
    this.height = height;
    this.MapChunk = MapChunk;
    /**
     * The chunk size as CHUNK_SIZE x CHUNK_SIZE
     * @const {type} name
     */
    this.CHUNK_SIZE = 400
  }

    /**
     * Adds a MapChunk to this map
     * @param {MapChunk} mapChunk - A MapChunk object
     */
  addChunk (mapChunk) {
    this.chunks[mapChunk.id] = mapChunk
    return this
  }

  removeChunk (mapChunkId) {
    delete this.chunks[mapChunkId]
  }

    /**
     * @return {Object} - Return the map chunks
     */
  getChunks () {
    return this.chunks
  }
}

module.exports = Map
