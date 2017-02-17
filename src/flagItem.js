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
            },
            timmer : setInterval(()=>{

                player.score++;
            },500)
        }

        for(let prop in player.bonus.increase){

            player[prop] += player.bonus.increase[prop]
        }

        player.setHealth(player.health+player.bonus.increase.maxHealth);
        player.ammo += player.bonus.increase.maxAmmo;
    }

    onDrop(player){

        clearInterval(player.bonus.timmer);
        for(let prop in player.bonus.increase){

            player[prop] -= player.bonus.increase[prop]
        }

        player.setHealth(player.health-player.bonus.increase.maxHealth)
        player.ammo -= player.bonus.increase.maxAmmo;
        if(player.ammo < 0) player.ammo = 0
        player.bonus = {}
    }

	render(){
		
        
		this.gfx.save();
        
        let POS_W = - this.width/2
        let POS_H = - this.height/2
        this.gfx.translate(POS_W,POS_H);
		this.gfx.font = this.width+"px FontAwesome";
		this.gfx.fillStyle = "#FF0000";
		this.gfx.fillText('\uf024',this.x , this.y);
		this.gfx.restore();

		return this;
	};

}

module.exports = FlagItem