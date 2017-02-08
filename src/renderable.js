/**
 * An interface that makes an object to be drawn with render method and some other functions.
 * @interface Renderable
 */
class Renderable {

    constructor(){

        if(new.target === Renderable){
            throw new TypeError("Cannot construct interface instance directly!");
        }
        if(this.render === undefined){
            throw new TypeError("This class must implement the render method");
        }
    }
}