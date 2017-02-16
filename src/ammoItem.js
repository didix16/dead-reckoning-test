let BaseItem = require('./baseItem')
let Rectangle = require('./rectangle')
class AmmoItem extends BaseItem
{

	constructor(o){

        super(o);
        this.setType(BaseItem.TYPE.AMMO);
        this.effect = BaseItem.EFFECT.CHARGE_AMMO;

        this.owner = o.owner || null;
        this.body = new Rectangle(o.x || 0,o.y || 0,this.width,this.height);
        this.usable = true;
        this.used = o.used || false
        this.timestamp = o.timestamp || this.timestamp

    }

    // At the moment allways return 5, means the ammo to be restored
    use(){

        this.used = true;
        return 5;
    }

	render(){
		
        
		this.gfx.save();
        
        let POS_W = - this.width/2
        let POS_H = - this.height/2
        this.gfx.translate(POS_W,POS_H);
        this.body.render("#966F33",true);
		this.gfx.font = "12px FontAwesome";
		this.gfx.fillStyle = "#000000";
		this.gfx.fillText('\uf135',this.x-1+this.width/4 , this.y + this.height-12+this.height/2);
		this.gfx.restore();

		return this;
	};

}

module.exports = AmmoItem