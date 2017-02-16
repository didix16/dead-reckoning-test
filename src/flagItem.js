let BaseItem = require('./baseItem')
class FlagItem extends BaseItem
{

	constructor(o){

        super(o);
        this.setType(BaseItem.TYPE.FLAG);
        this.effect = BaseItem.EFFECT.BONUS;

        this.owner = o.owner || null;
        this.body = null;
        this.usable = false;
        this.timestamp = o.timestamp || this.timestamp

    }

    onPickup(player){

        player.bonus = {
            increase: {
                maxHealth: 500,
                maxAmmo: 25,
                defense: 2
            }
        }
    }

    onDrop(player){

        player.bonus = {}
    }

	render(){
		
        
		this.gfx.save();
        
        let POS_W = - this.width/2
        let POS_H = - this.height/2
        this.gfx.translate(POS_W,POS_H);
        this.body.render("#fff",true);
		this.gfx.font = this.width+"px FontAwesome";
		this.gfx.fillStyle = "#FF0000";
		this.gfx.fillText('\uf024',this.x , this.y);
		this.gfx.restore();

		return this;
	};

}

module.exports = FlagItem