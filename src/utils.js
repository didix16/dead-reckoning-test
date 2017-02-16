let globals = require("./globals")
let ACCEL = globals.getGlobal("ACCEL");
if(!ACCEL){
  globals.addGlobal("ACCEL",1/1000);
  ACCEL = globals.getGlobal("ACCEL");
}
module.exports = {

  degreeToRadian (d) {
    return Math.PI * d / 180;
  },

  radianToDegree (r) {
    return 180 * r / Math.PI;
  },

  calculatePlayerAcceleration(player){

    let { inputs, vxDir, vyDir } = player
    let ax = 0
    let ay = 0
    console.log("ACCELERATION IS==>",ACCEL);
    if(!ACCEL) throw new Error("A");
    if (inputs.LEFT_ARROW) ax -= ACCEL
    if (inputs.RIGHT_ARROW) ax += ACCEL
    if (inputs.UP_ARROW) ay -= ACCEL
    if (inputs.DOWN_ARROW) ay += ACCEL

    player.ax = ax
    player.ay = ay

    player.vxDir = vxDir
    player.vyDir = vyDir
  }

}
