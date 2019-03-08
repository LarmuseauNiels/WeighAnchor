class Player {
    constructor(player){
      this.name = player.name;
      this.boat = new Boat(0,0,0,0);
      this.boat.sync(player.boat);
      this.id = player.id;
    }
    sync(player){
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
  }
  sync(boat){
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
    if (keysDown[K_LEFT]) {
      this.imgAngleSpeed -= this.rotationpower;
    }
    if (keysDown[K_RIGHT]) {
      this.imgAngleSpeed += this.rotationpower;
    }
    if (keysDown[K_UP]) {
      this.addVector(this.imgAngle, this.linearpower);
    }
  }
  checkDrag() {
    this.speed *= 1 - this.lineardrag;
    this.imgAngleSpeed *= 1 - this.rotationdrag;
  }
  /*
  _draw() {
    let ctx = this.context;
    ctx.save();
    ctx.translate(this.cWidth / 2, this.cHeight / 2);
    ctx.rotate(this._imgAngle);
    if (this.animation != false) {
      this.animation.drawFrame(ctx);
    } else {
      ctx.drawImage(this._image, super.x, super.y, this.width, this.height);
    }
    ctx.restore();
  }*/
  stop() {
    this.speed = -this.speed;
  }
}