let BaseItem = require('./baseItem')
let Rectangle = require('./rectangle')
class HealthItem extends BaseItem
{

	constructor(o){

        super(o);
        this.setType(this.TYPE.HEALTH);
        this.effect = this.EFFECT.HEALTH;

        this.owner = o.owner || null;
        this.body = new Rectangle(o.x || 0,o.y || 0,this.width,this.height);
        this.usable = true;
        this.used = o.used || false
        this.timestamp = o.timestamp || this.timestamp

    }

    // At the moment allways return 25, means the health to be restored
    use(){

        this.used = true;
        return 25;
    }

	render(){
		
        
		this.gfx.save();
        
        let POS_W = - this.width/2
        let POS_H = - this.height/2
        this.gfx.translate(POS_W,POS_H);
        this.body.render("#fff",true);
		this.gfx.font = "12px FontAwesome";
		this.gfx.fillStyle = "#FF0000";
		this.gfx.fillText('\uf067',this.x-1+this.width/4 , this.y + this.height-12+this.height/2);
		this.gfx.restore();

		return this;
	};

}

module.exports = HealthItem