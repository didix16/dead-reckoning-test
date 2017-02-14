let globals = require("./globals")
let ACCEL = globals.getGlobal("ACCEL");
module.exports = {

  degreeToRadian (d) {
    return Math.PI * d / 180
  },

  radianToDegree (r) {
    return 180 * r / Math.PI
  },

  calculatePlayerAcceleration(player){

    const { inputs } = player
    let ax = 0
    let ay = 0
    if (inputs.LEFT_ARROW) ax -= ACCEL
    if (inputs.RIGHT_ARROW) ax += ACCEL
    if (inputs.UP_ARROW) ay -= ACCEL
    if (inputs.DOWN_ARROW) ay += ACCEL

    player.ax = ax
    player.ay = ay
  }

}
