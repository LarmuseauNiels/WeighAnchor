/* Piece Of Cake Gaming Server Core
  a very basic game library for the canvas tag
  expects an  ES2015 compliant nodeserver
  Author: Niels Larmuseau
*/

class Sprite {
  //core class for game engine
  constructor(width, height, x = 400, y = 400) {
    this.width = width;
    this.height = height;
    this._x = x;
    this._y = y;
    this._dx = 0;
    this._dy = 0;
    this._imgAngle = 0;
    this._moveAngle = 0;
    this._speed = 0;
    this._imgAngleSpeed = 0;
    this._moveAngleSpeed = 0;
  }
  //GETTERS AND SETTERS
  set position(pos) {
    //position is position of center
    //pos = {x:0,y:0}
    this._x = pos.x;
    this._y = pos.y;
  }
  get position() {
    return {
      x: this._x,
      y: this._y
    };
  }
  set x(nx) {
    this._x = nx;
  }
  get x() {
    return this._x;
  }
  set y(ny) {
    this._y = ny;
  }
  get y() {
    return this._y;
  }
  set dx(ndx) {
    this._dx = ndx;
  }
  get dx() {
    return this._dx;
  }
  set dy(ndy) {
    this._dy = ndy;
  }
  get dy() {
    return this._dy;
  }
  calcVector() {
    //used throughout speed / angle calculations to 
    //recalculate dx and dy based on speed and angle
    this._dx = this._speed * Math.cos(this._moveAngle);
    this._dy = this._speed * Math.sin(this._moveAngle);
  }
  calcSpeedAngle() {
    //opposite of calcVector:
    //sets speed and moveAngle based on dx, dy
    this._speed = Math.sqrt((this._dx * this._dx) + (this._dy * this._dy));
    this._moveAngle = Math.atan2(this._dy, this._dx);
  }
  set speed(speed) {
    this._speed = speed;
    this.calcVector();
  }
  get speed() {
    return this._speed;
  }
  calcSpeed() {
    //calculate speed based on current dx and dy
    let speed = Math.sqrt((this._dx * this._dx) + (this._dy * this._dy));
    return speed;
  }
  set imgAngle(degrees) {
    //offset degrees by 90
    degrees = degrees - 90;
    //convert degrees to radians
    this._imgAngle = degrees * Math.PI / 180;
  }
  get imgAngle() {
    //imgAngle is stored in radians.
    //return it in degrees
    //don't forget we offset the angle by 90 degrees
    return (this._imgAngle * 180 / Math.PI) + 90;
  }
  set imgAngleSpeed(ias) {
    this._imgAngleSpeed = ias;
  }
  get imgAngleSpeed() {
    return this._imgAngleSpeed;
  }

  set moveAngle(degrees) {
    //take movement angle in degrees
    // offset degrees by 90
    degrees = degrees - 90;
    //convert to radians
    this._moveAngle = degrees * Math.PI / 180;
    this.calcVector();
  }
  get moveAngle() {
    //moveAngle is stored in radians.return it in degrees
    //don't forget we offset the angle by 90 degrees
    return (this._moveAngle * 180 / Math.PI) + 90;
  }

  set moveAngleSpeed(mas) {
    this._moveAngleSpeed = mas;
  }
  get moveAngleSpeed() {
    return this._moveAngleSpeed;
  }

  //convenience functions combine move and img angles
  set angle(degrees) {
    this.moveAngle = (degrees);
    this.imgAngle = (degrees);
  }
  get angle() {
    return (this.moveAngle + this.imgAngle) / 2;
  }
  changeAngleBy(degrees) {
    this.changeMoveAngleBy(degrees);
    this.changeImgAngleBy(degrees);
  }
  turnBy(degrees) {
    this.changeAngleBy(degrees);
  } //same as changeAngleBy
  set angleSpeed(as) {
    this.moveAngleSpeed = as;
    this.imgAngleSpeed = as;
  }
  get angleSpeed() {
    return (this.moveAngleSpeed + this.imgAngleSpeed) / 2;
  }
  changeAngleSpeedBy(asby) {
    this.moveAngleSpeed += as;
    this.imgAngleSpeed += as;
  }
  // adding vectors allows a simple way of having linear momentum    
  addVector(degrees, thrust) {
    //Modify the current motion vector by adding a new vector to it.
    //offset angle by 90 degrees
    degrees -= 90;
    //input angle is in degrees - convert to radians    
    let angle = degrees * Math.PI / 180;

    //calculate dx and dy
    let newDX = thrust * Math.cos(angle);
    let newDY = thrust * Math.sin(angle);
    this._dx += newDX;
    this._dy += newDY;

    //ensure speed and angle are updated
    this.calcSpeedAngle();
  }

  collidesWith(sprite) { // main way to do collision detection
    //check for collision with another sprite
    //collisions only activated when both sprites are visible
    collision = false;
    if (this.visible) {

      if (sprite.visible) {
        //define borders
        myLeft = this._x - (this.width / 2);
        myRight = this._x + (this.width / 2);
        myTop = this._y - (this.height / 2);
        myBottom = this._y + (this.height / 2);
        otherLeft = sprite.x - (sprite.width / 2);
        otherRight = sprite.x + (sprite.width / 2);
        otherTop = sprite.y - (sprite.height / 2);
        otherBottom = sprite.y + (sprite.height / 2);

        //assume collision
        collision = true;

        //determine non-colliding states
        if ((myBottom < otherTop) ||
          (myTop > otherBottom) ||
          (myRight < otherLeft) ||
          (myLeft > otherRight)) {
          collision = false;
        } // end if

      } // end 'other visible' if
    } // end 'I'm visible' if
    return collision;
  }

  distanceTo(sprite) {
    diffX = this._x - sprite.x;
    diffY = this._y - sprite.y;
    dist = Math.sqrt((diffX * diffX) + (diffY * diffY));
    return dist;
  }

  angleTo(sprite) { //aims sprite towards sprite
    //get centers of sprites
    myX = this._x + (this.width / 2);
    myY = this._y + (this.height / 2);
    otherX = sprite.x + (sprite.width / 2);
    otherY = sprite.y + (sprite.height / 2);

    //calculate difference
    diffX = myX - otherX;
    diffY = myY - otherY;
    radians = Math.atan2(diffY, diffX);
    degrees = radians * 180 / Math.PI;
    //degrees are offset
    degrees += 90;
    return degrees;
  }

  updateConst() { // Depricated Pls give elapsed time from graphics loop.
    this._imgAngle += this._imgAngleSpeed;
    this._moveAngle += this._moveAngleSpeed;
    this._x += this._dx;
    this._y += this._dy;
  }

  report() {
    //used only for debugging. Requires browser with JS console
    console.log("x: " + this.x + ", y: " + this.y + ", dx: " +
      this.dx + ", dy: " + this.dy +
      ", speed: " + this.speed +
      ", angle: " + this.moveAngle);
  }
} // end Sprite class

class Timer {
  //simple timer
  constructor() {
    this.reset();
  }
  reset() {
    this.date = new Date();
    this.startTime = this.date.getTime();
    this.elapsedTime = 0;
  }
  getCurrentTime() {
    this.date = new Date();
    return this.date.getTime();
  }
  getElapsedTime() {
    current = this.getCurrentTime();
    return (current - this.startTime) / 1000;
  }
  //make alias functions for animations...
  start() {
    this.reset();
  }
  getTimeElapsed() {
    this.getElapsedTime();
  }
} // end Timer def

module.exports.Sprite = Sprite;