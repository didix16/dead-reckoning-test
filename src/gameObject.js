const Renderable = require("./renderable");
/**
 * Represents a in-game object in 2D. Has a x,y width and height
 * @public 
 * @constructor {GameObject} GameObject
 * @class {GameObject} GameObject
 */
class GameObject extends Renderable{

    constructor(x = 0, y = 0, width = 0, height = 0){
        super();
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;

        //Initial speed at 0
        this.vx = 0;
        this.vy = 0;
    }

    /**
     * Set the position of the object in the world
     * @public 
     * @param {integer} x - The new X coordinate
     * @param {integer} y - The new Y coordinate
     * @return {GameObject} - Return self instance for chaining
     */
    setPosition(x,y){

        this.x = x;
        this.y = y;
        return this;
    }

    /**
     * Set the speed of the object in the world
     * @public 
     * @param {double} sx - Speed X value
     * @param {double} sy - Speed Y value
     * @return {GameObject} - Return self instance for chaining
     */
    setSpeed(sx,sy){

        this.vx = sx;
        this.vy = sy;
        return this;
    }

    /**
     * Get the current position of the object in the world
     * @public 
     * @return {PlainObject} - A plain object with x and y keys identifying the object position
     */
    getPosition(){
        return {x:this.x, y:this.y};
    }

    /**
     * Set the width of this object
     * @param {integer} width - The new width of the object
     * @return {GameObject} - Return self instance for chaining
     */
    setWidth(width){

        this.width = width;
        return this;
    }

    /**
     * Set the height of this object
     * @param {integer} height - The new height of the object
     * @return {GameObject} - Return self instance for chaining
     */
    setHeight(height){

        this.height = height;
        return this;
    }

    /**
     * A method that each GameObject must be implemented for self rendering in the GameWorld
     * @public 
     * @return {GameObject} - Return self instance for chaining
     */
    render(){

        return this;
    }
}

module.exports = GameObject;