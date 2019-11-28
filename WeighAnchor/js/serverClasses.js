const engine = require('./engine');
const shortid = require('shortid');

class Region {
    constructor(playermap, aimap) {
        this.playermap = playermap;
        this.ai = aimap;
        this.map = null;
        this.CannonBalls = [];
    }
    join() {
        let p1 = new Player();
        this.playermap.set(p1.id, p1);
        return p1;
    }
    fire(obj) {
        this.CannonBalls.push(obj.cannonball);
    }
    moveSync(obj) {
        let p1 = this.playermap.get(obj.id);
        p1.moveSync(obj.boat);
    }
    toJSON(){
        return {
            playermap: [...this.playermap],
            //ai: [...this.ai]
        };
    }
}

class Player {
    constructor() {
        this.name = "Player";
        //this.boat = new Boat(0.15, 0.007, 0.04, 0.08);
        this.boat = new Boat(0.075, 0.0035, 0.02, 0.04);
        this.id = shortid.generate();
        this.missedTicks = 0;
    }
    moveSync(newboat) { //TODO move logic to sprite;
        this.boat._x = newboat._x;
        this.boat._y = newboat._y;
        this.boat.dx = newboat._dx;
        this.boat.dy = newboat._dy;
        this.boat._speed = newboat._speed;
        this.boat._moveAngle = newboat._moveAngle;
        this.boat._imgAngle = newboat._imgAngle;
        this.boat._moveAngleSpeed = newboat._moveAngleSpeed;
        this.boat._imgAngleSpeed = newboat._imgAngleSpeed;
        this.missedTicks = 0;
    }
    

}

class Map {
    constructor() {

    }
}

class Boat extends engine.Sprite { //TODO change to multiple parts
    constructor(linearpower, rotationpower, lineardrag, rotationdrag) {
        super(100, 50);
        this.rotationpower = rotationpower;
        this.linearpower = linearpower;
        this.lineardrag = lineardrag;
        this.rotationdrag = rotationdrag;
    }
    checkDrag() {
        this.speed *= 1 - this.lineardrag;
        this.imgAngleSpeed *= 1 - this.rotationdrag;
    }
    stop() {
        this.speed = -this.speed;
    }
}

module.exports.Region = Region;
module.exports.Player = Player;
module.exports.Boat = Boat;