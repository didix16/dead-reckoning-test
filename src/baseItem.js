let GameObject = require('./gameObject')
class BaseItem extends GameObject
{   

    constructor(o){
        super(o.id,o.x,o.y,o.width,o.height,o.radius)
        this.owner = null;

        // The body that represents the item on the ground
        this.body = null;

        // Constants that represent what kind of item is
        

        this.type = -1; // By default JOKE

        this.effect = -1; // By default nothing

        this.usable = false; // Tells if the item is usable or not
        this.used = false; // Only meaning if the item is usable
        this.timestamp = 0;
    }

	getType(){

		return this.type;
	}


	setType(t){

		this.type = t;

		// Makes the item usable if the type of item is a trap
		if(this.type == BaseItem.TYPE.TRAP) this.usable = true;
		return this;
	};

	getEffect(){

		return this.effect;
	}

	// Interface method
	effectHandler(params){ return this};

	playerInArea(player){

	};

	pickUp(player){

        return this;
	};

	// Triggers only the onUsed event if the item is usable
	use(player){

		return this;
	};

	// Spawn the item at pos(x,y). If x or y don't belongs to wolrd coordinates, return false, else trigger spawnItem event
	spawnAt(x,y){

		this.x = x;
		this.y = y;

		if(this.body && this.body.x !== undefined && this.body.y !== undefined){
			this.body.x = x;
			this.body.y = y;
		}else{
			console.error("BaseItem::spawnAt: the item has not a body to be drawed");
			return false;
		}

		return this;
	};

	render(){

		return this;
	};

}

// Static variables
BaseItem.TYPE = {

	JOKE: -1, // Means on pickup can explode and substract health
	HEALTH: 0,
	AMMO: 1, // Example: Missiles
	TRAP: 2, // Example, can be a IA Turret, Mine, etc..
	WEAPON: 3, // Not implemented yet
	FLAG: 4 // For CTF
};

// Constants that represent what kind of effect makes the item
BaseItem.EFFECT = {
	NONE: -1,
	HEALTH: 0,
	CHARGE_AMMO: 1,
	DAMAGE: 2,
	BONUS: 3

};

module.exports = BaseItem