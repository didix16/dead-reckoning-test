let globals = {

  vars: {},
  consts: {

  },
    /**
     * Adds a global var to be accesible form anywhere
     * @param {String} key
     * @param {any} value
     * @return {PlainObject} - Returns global object for chaining
    */
  addGlobal (key, value) {
    this.vars[key] = value
    return this
  },

    /**
     * The value of the global with specific key
     * @param {String} key
     * @returns The value of the global with specific key
     */
  getGlobal (key) {
    return this.vars[key]
  },

    /**
     * The value of a CONSTANT global with specific constKey
     * @param {String} constKey
     * @returns The value of the CONSTANT global with specific constKey
     */
  getConstant (constKey) {
    return this.consts[constKey]
  }
}

module.exports = globals
