const GameObject = require("./gameObject");
/**
 * A camera that foucus the scene in some part of the game world
 * @public
 * @param {integer} x - GameCamera x coordinate position
 * @param {integer} y - GameCamera y coordinate position
 * @param {width} width - The width of the GameCamera
 * @param {height} height - The height of the GameCamera
 * @constructor {GameCamera} GameCamera
 */
class GameCamera extends GameObject{

    constructor(x,y,width,height){
        super(x,y,width,height);
    }

    /**
     * Centers the camera to the object. If the object is in some corner, the camera will be adjusted
     * @function GameCamera.focusOn
     * @param {GameObject} object - A GameObject to be focused on
     * @return {GameCamera} - Return a self reference for chaining
     */
    focusOn(object){

        this.x = object.x - this.width / 2;
        this.y = object.y - this.height / 2;

        if(this.x < 0) this.x = 0;
        if(this.y < 0) this.y = 0;
        return this;
    }
}

module.exports = GameCamera;