var game;
var boat;
var camera;
class Boat extends Sprite {
    constructor(){
        super(game, "boat.png", 100, 50);
    }
    checkKeys(etime) {
        if (keysDown[K_LEFT]) {
            this.imgAngleSpeed -= 0.007;
        }

        if (keysDown[K_RIGHT]) {
            this.imgAngleSpeed += 0.007;
        }

        if (keysDown[K_UP]) {
            this.addVector(this.imgAngle, 0.15);
        }
    } // end checkKeys
    checkDrag(etime) {
        this.speed *= 0.96;
        this.imgAngleSpeed *= 0.92;
        shipdebugger(this.speed);
    }
}

function init() {
    game = new Scene();
    game.setBG("#333399");
    boat = new Boat();
    camera =  new Camera(game);
    camera.followSprite(boat);
    game.start();
    boat.angle = 90;
} // end init

function graphicsupdate(etime) {
    game.clear();
    boat.update(etime);
    camera.update();
}

function physicsupdate() {
    boat.checkKeys();
    boat.checkDrag();
}

function shipdebugger(speed, drag, a, b) {
    document.getElementById("shipdebugger").innerHTML = "speed: " + Math.round(speed * 100, 2) / 100;
}