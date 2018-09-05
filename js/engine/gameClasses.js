class Boat extends Sprite {
    constructor(linearpower, rotationpower, lineardrag, rotationdrag) {
      super(game, "boat.png", 100, 50);
      this.rotationpower = rotationpower;
      this.linearpower = linearpower;
      this.lineardrag = lineardrag;
      this.rotationdrag = rotationdrag;
    }
    checkKeys(etime) {
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
    checkDrag(etime) {
      this.speed *= 1 - this.lineardrag;
      this.imgAngleSpeed *= 1 - this.rotationdrag;
    }
    _draw() {
      let ctx = this.context;
      ctx.save();
      ctx.translate(this.cWidth / 2, this.cHeight / 2);
      ctx.rotate(this._imgAngle);
      if (this.animation != false) {
        this.animation.drawFrame(ctx);
      } else {
        ctx.drawImage(this._image, 0 - (this.width / 2), 0 - (this.height / 2), this.width, this.height);
      }
      ctx.restore();
    }
    stop() {
      this.speed = -this.speed;
    }
  }