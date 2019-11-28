class Player {
    constructor(player) {
        this.name = player.name;
        this.boat = new Boat(0, 0, 0, 0);
        this.boat.sync(player.boat);
        this.id = player.id;
    }
    sync(player) {
        this.boat.sync(player.boat);
    }
}

class Boat extends Sprite {
    constructor(linearpower, rotationpower, lineardrag, rotationdrag) {
        super(game, "boat.png", 100, 50);
        this.rotationpower = rotationpower;
        this.linearpower = linearpower;
        this.lineardrag = lineardrag;
        this.rotationdrag = rotationdrag;
        super.setCameraRelative(tilemap.camera);
        this.fireCooldownA = 100;
        this.fireCooldownB = 100;
    }
    sync(boat) {
        super.width = boat.width;
        super.height = boat.height;
        super.x = boat._x;
        super.y = boat._y;
        super.speed = boat._speed;
        super.dx = boat._dx;
        super.dy = boat._dy;
        super._imgAngle = boat._imgAngle;
        super._moveAngle = boat._moveAngle;
        this.imgAngleSpeed = boat._imgAngleSpeed;
        this.moveAngleSpeed = boat._moveAngleSpeed;
        this.rotationpower = boat.rotationpower;
        this.linearpower = boat.linearpower;
        this.lineardrag = boat.lineardrag;
        this.rotationdrag = boat.rotationdrag;
    }
    checkKeys() {
        this.fireCooldownA--;
        this.fireCooldownB--;
        if (keysDown[K_LEFT] || keysDown[K_Q]) {
            this.imgAngleSpeed -= this.rotationpower;
        }
        if (keysDown[K_RIGHT] || keysDown[K_D]) {
            this.imgAngleSpeed += this.rotationpower;
        }
        if (keysDown[K_UP] || keysDown[K_Z]) {
            this.addVector(this.imgAngle, this.linearpower);
        }
        if (keysDown[K_A] && this.fireCooldownA < 0) {
            this.fireCooldownA = 100;
            FireCannon(-90);
        }
        if (keysDown[K_E] && this.fireCooldownB < 0) {
            this.fireCooldownB = 100;
            FireCannon(90);
        }
    }
    checkDrag() {
        this.speed *= 1 - this.lineardrag;
        this.imgAngleSpeed *= 1 - this.rotationdrag;
    }

    FireCannon( direction) {
        CannonBalls.push(new CannonBall(super.x, super.y, super.imgAngle + direction));
    }

    stop() {
        this.speed = -this.speed;
    }
}

class CannonBall extends Sprite {
    /**
     * /
     * @param {any} X
     * @param {any} Y
     * @param {any} fireAngle
     *
     */
    //TODO FIX carry momentum from moving ship


    constructor(X, Y, fireAngle, ) {
        super(game, "cannonBall.png", 10, 10);
        super.setCameraRelative(tilemap.camera);
        this.lineardrag = 0.008;
        super.x = X;
        super.y = Y;
        super.speed = 8;
        super.moveAngle = fireAngle;


        socket.send(JSON.stringify({
            action: "fire",
            cannonball: this
        }));
    }

    checkDrag() {
        this.speed *= 1 - this.lineardrag;
    }
}