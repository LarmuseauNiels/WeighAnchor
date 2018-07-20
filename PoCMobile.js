/*
Piece of Cake Mobile Module!
*/

class Joy {
  //virtual joystick for ipad
  //console.log("joystick created");
  //when activated, document will have the following properties
  //mouseX, mouseY: touch read as mouse input
  //diffX, diffY: touch motion read as a joystick input
  //if virtKeys is set true
  //joystick inputs will be read as arrow keys
  constructor() {
    this.SENSITIVITY = 50;
    this._diffX = 0;
    this._diffY = 0;
    this.touches = [];
    this.startX = null;
    this.startY = null;
    //add event handlers if appropriate
    touchable = 'createTouch' in document;
    if (touchable) {
      document.addEventListener('touchstart', this.onTouchStart, false);
      document.addEventListener('touchmove', this.onTouchMove, false);
      document.addEventListener('touchend', this.onTouchEnd, false);
    }
  }


  //define event handlers
  onTouchStart(event) {
    let result = "touch: ";
    this.touches = event.touches;
    this.startX = touches[0].screenX;
    this.startY = touches[0].screenY;
    result += "x: " + this.startX + ", y: " + this.startY;
    //define mouse position based on touch position
    this._mouseX = startX;
    this._mouseY = startY;
  }

  onTouchMove(event) {
    let result = "move: ";
    event.preventDefault();
    this.touches = event.touches;
    //map touch position to mouse position
    this._mouseX = touches[0].screenX;
    this._mouseY = touches[0].screenY;
    this._diffX = touches[0].screenX - this.startX;
    this._diffY = touches[0].screenY - this.startY;
    result += "dx: " + this._diffX + ", dy: " + this._diffY;
    //manage virtual keys if enabled    
    if (virtKeys) {
      let THRESHHOLD = 10;
      if (this._diffX > THRESHHOLD) {
        keysDown[K_RIGHT] = true;
      } else {
        keysDown[K_RIGHT] = false;
      }
      if (this._diffX < -THRESHHOLD) {
        keysDown[K_LEFT] = true;
      } else {
        keysDown[K_LEFT] = false;
      }
      if (this._diffY > THRESHHOLD) {
        keysDown[K_DOWN] = true;
      } else {
        keysDown[K_DOWN] = false;
      }
      if (this._diffY < -THRESHHOLD) {
        keysDown[K_UP] = true;
      } else {
        keysDown[K_UP] = false;
      }
    }
  }

  onTouchEnd(event) {
    let result = "no touch";
    this.touches = event.touches;
    this._diffX = 0;
    this._diffY = 0;
    //turn off all virtual keys
    if (virtKeys) {
      keysDown[K_LEFT] = false;
      keysDown[K_RIGHT] = false;
      keysDown[K_UP] = false;
      keysDown[K_DOWN] = false;
    }
  }

  // add utility methods to retrieve various attributes
  get diffX() {
    //compensate for possible null
    if (this._diffX == null) {
      this._diffX = 0;
    }
    return this._diffX;
  }
  get diffY() {
    //compensate for possible null
    if (this._diffY == null) {
      this._diffY = 0;
    }
    return this._diffY;
  }

  get mouseX() {
    return this._mouseX;
  }
  get mouseY() {
    return this._mouseY;
  }
} // end joy class def

class Accel {
  constructor() {
    //virtual accelerometer
    //properties
    var ax;
    var ay;
    var az;

    var rotX;
    var rotY;
    var rotZ;

    if (window.DeviceMotionEvent == undefined) {
      console.log("This program requires an accelerometer");
    } else {
      window.ondevicemotion = this.onDeviceMotion;
    } // end if
  }
  //event handeler
  onDeviceMotion(event) {
    this.ax = event.accelerationIncludingGravity.x;
    this.ay = event.accelerationIncludingGravity.y;
    this.az = event.accelerationIncludingGravity.z;

    rotation = event.rotationRate;
    if (rotation != null) {
      this.rotX = Math.round(rotation.alpha);
      this.rotY = Math.round(rotation.beta);
      this.rotZ = Math.round(rotation.gamma);
    }
  }
  //return values with utility methods
  get AX() {
    if (window.ax == null) {
      window.ax = 0;
    }
    return window.ax;
  }
  get AY() {
    if (window.ay == null) {
      window.ay = 0;
    }
    return window.ay;
  }
  get AZ() {
    if (window.az == null) {
      window.az = 0;
    }
    return window.az;
  }
  get RotX() {
    return rotX;
  }
  get RotY() {
    return rotY;
  }
  get RotZ() {
    return rotZ;
  }
} // end class def