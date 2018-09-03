//(function () {
//  'use strict';

  /* pieceOfCakeGaming.js
     a very basic game library for the canvas tag
     loosely based on Python gameEngine
     and Scratch
     expects an HTML5-compliant browser
     includes support for mobile browsers
     Main code and design: Niels Larmuseau
  */

  //debugging variables
  const debug = true;
  //variable holding key being pressed
  var currentKey = null;
  var keysDown = new Array(256);
  var virtKeys = false;

  //polyfill by https://gist.github.com/paulirish/1579671
  // used to allow for dynamic framerates in older browsers.
  (function () {
    var lastTime = 0;
    var vendors = ['ms', 'moz', 'webkit', 'o'];
    for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
      window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
      window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame'] ||
        window[vendors[x] + 'CancelRequestAnimationFrame'];
    }

    if (!window.requestAnimationFrame)
      window.requestAnimationFrame = function (callback, element) {
        var currTime = new Date().getTime();
        var timeToCall = Math.max(0, 16 - (currTime - lastTime));
        var id = window.setTimeout(function () {
            callback(currTime + timeToCall);
          },
          timeToCall);
        lastTime = currTime + timeToCall;
        return id;
      };

    if (!window.cancelAnimationFrame)
      window.cancelAnimationFrame = function (id) {
        clearTimeout(id);
      };
  }());

  class Sprite {
    //core class for game engine
    constructor(scene, imageFile, width, height, x = 400, y = 400) {
      this.scene = scene;
      this.canvas = scene.canvas;
      this.context = this.canvas.getContext("2d");
      this._image = new Image();
      this._image.src = imageFile;
      this.animation = false; // becomes Animation Class
      this.width = width;
      this.height = height;
      this.cHeight = parseInt(this.canvas.height);
      this.cWidth = parseInt(this.canvas.width);
      this._x = x;
      this._y = y;
      this._dx = 0;
      this._dy = 0;
      this._imgAngle = 0;
      this._moveAngle = 0;
      this._speed = 0;
      this._imgAngleSpeed = 0;
      this._moveAngleSpeed = 0;
      this.camera = false;
      this.visible = true;
      this._boundAction = STOP;
    }
    //GETTERS AND SETTERS
    set image(imgFile) {
      this._image.src = imgFile;
    }
    get image() {
      return this._image.src;
    }

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

    set boundAction(action) {
      this._boundAction = action;
    }
    get boundAction() {
      return this._boundAction;
    }

    hide() {
      this.visible = false;
    }
    show() {
      this.visible = true;
    }

    //THIS.animation feaders
    renameCycles(cycleNames) {
      this.animation.renameCycles(cycleNames);
    }
    specifyCycle(cycleName, startingCell, frames) {
      this.animation.addCycle(cycleName, startingCell, frames);
    }
    specifyState(stateName, cellName) {
      this.animation.addCycle(stateName, cellName, 1);
    }
    set CurrentCycle(cycleName) {
      this.animation.setCycle(cycleName);
    }
    get CurrentCycle() {
      return this.animation.cycleName;
    }
    pauseAnimation() {
      this.animation.pause();
    }
    playAnimation() {
      this.animation.play();
    }
    resetAnimation() {
      this.animation.reset();
    }
    set animationSpeed(speed) {
      this.animation.setAnimationSpeed(speed);
    }
    get animationSpeed() {
      return this.animation.speed;
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

    _draw() {
      //draw self on canvas;
      //intended only to be called from update, should never
      //need to be deliberately called by user
      let ctx = this.context;

      ctx.save();
      //The following lines are for Tyler's code. Removed for now
      //if( this.camera ){ ctx.translate(this.x - this.camera.cameraOffsetX, this.y - this.camera.cameraOffsetY); }
      //else{ ctx.translate(this.x, this.y); }

      //transform element
      ctx.translate(this.x, this.y);
      ctx.rotate(this._imgAngle);

      //draw image with center on origin
      if (this.animation != false) {
        this.animation.drawFrame(ctx);
      } else {
        ctx.drawImage(this._image,
          0 - (this.width / 2),
          0 - (this.height / 2),
          this.width, this.height);
      }
      ctx.restore();
    }

    updateConst() { // Depricated Pls give elapsed time from graphics loop.
      this._imgAngle += this._imgAngleSpeed;
      this._moveAngle += this._moveAngleSpeed;
      this._x += this._dx;
      this._y += this._dy;
      this.checkBounds();
      if (this.visible) {
        this._draw();
      } // end if
    }

    update(etime) { // moves the sprite based on the time since last frame, use in graphics update
      this._imgAngle += ((this._imgAngleSpeed / 50) * etime);
      this._moveAngle += ((this._moveAngleSpeed / 50) * etime);
      this._x += ((this._dx / 50) * etime);
      this._y += ((this._dy / 50) * etime);
      this.checkBounds();
      if (this.visible) {
        this._draw();
      } // end if
    }

    checkBounds() {
      //behavior changes based on
      //boundAction property
      let camX = 0;
      let camY = 0;
      if (this.camera) {
        camX = this.camera.cameraOffsetX;
        camY = this.camera.cameraOffsetY;
      }
      let rightBorder = this.cWidth + camX;
      let leftBorder = camX;
      let topBorder = camY;
      let bottomBorder = this.cHeight + camY;

      let offRight = false;
      let offLeft = false;
      let offTop = false;
      let offBottom = false;
      if (this.x > rightBorder) {
        offRight = true;
      }
      if (this.x < leftBorder) {
        offLeft = true;
      }
      if (this.y > bottomBorder) {
        offBottom = true;
      }
      if (this.y < 0) {
        offTop = true;
      }
      if (this.boundAction == WRAP) {
        if (offRight) {
          this.x = leftBorder;
        } // end if
        if (offBottom) {
          this.y = topBorder;
        } // end if
        if (offLeft) {
          this.x = rightBorder;
        } // end if
        if (offTop) {
          this.y = bottomBorder;
        }
      } else if (this.boundAction == BOUNCE) {
        if (offTop || offBottom) {
          this.dy *= -1;
          this.calcSpeedAngle();
          this.imgAngle = this.moveAngle;
        }
        if (offLeft || offRight) {
          this.dx *= -1;
          this.calcSpeedAngle();
          this.imgAngle = this.moveAngle;
        }
      } else if (this.boundAction == STOP) {
        if (offLeft || offRight || offTop || offBottom) {
          this.speed = 0;
        }
      } else if (this.boundAction == DIE) {
        if (offLeft || offRight || offTop || offBottom) {
          this.hide();
          this.speed = 0;
        }
      } else { /*keep on going forever*/ }
    }

    loadAnimation(imgWidth, imgHeight, cellWidth, cellHeight) {
      this.animation = new Animation(this.image, imgWidth, imgHeight, cellWidth, cellHeight);
      this.animation.setup();
    }

    generateAnimationCycles(slicingFlag, framesArray) {
      //Default: assume each row is a cycle and give them names Cycle1, Cycle2, ... , CycleN
      //SINGLE_ROW: all the sprites are in one row on the sheet, the second parameter is either a number saying each cycle is that many frames or a list of how many frames each cycle is
      //SINGLE_COLUMN: all the sprites are in one column on the sheet, the second parameter is either a number saying each cycle is that many frames or a list of how many frames each cycle is
      //VARIABLE_LENGTH: How many frames are in each cycle. framesArray must be defined.
      cWidth = this.animation.cellWidth;
      cHeight = this.animation.cellHeight;
      iWidth = this.animation.imgWidth;
      iHeight = this.animation.imgHeight;
      numCycles = 0;
      nextStartingFrame = 0;
      if (typeof framesArray == "number" || typeof slicingFlag == "undefined") {
        if (slicingFlag == SINGLE_COLUMN) {
          numCycles = (iHeight / cHeight) / framesArray;
        } else if (typeof slicingFlag == "undefined") {
          numCycles = (iHeight / cHeight);
          framesArray = iWidth / cWidth;
        } else {
          numCycles = (iWidth / cWidth) / framesArray;
        }
        for (i = 0; i < numCycles; i++) {
          cycleName = "cycle" + (i + 1);
          this.specifyCycle(cycleName, i * framesArray, framesArray);
        }
      } else {
        numCycles = framesArray.length;
        for (i = 0; i < numCycles; i++) {
          cycleName = "cycle" + (i + 1);
          this.specifyCycle(cycleName, nextStartingFrame, framesArray[i]);
          nextStartingFrame += framesArray[i];
        }
      }
      this.CurrentCycle = "cycle1";
    }

    isMouseDown() {
      //determines if mouse is clicked on this element
      mx = this.scene.getMouseX();
      my = this.scene.getMouseY();
      sLeft = this.x - (this.width / 2);
      sRight = this.x + (this.width / 2);
      sTop = this.y - (this.height / 2);
      sBottom = this.y + (this.height / 2);
      hit = false;

      if (mx > sLeft) {
        if (mx < sRight) {
          if (my > sTop) {
            if (my < sBottom) {
              if (this.scene.touchable) {
                //if it's a touchable interface,
                //this is a hit
                hit = true;
              } else {
                //for a normal mouse, check for clicked, too
                if (this.scene.getMouseClicked()) {
                  hit = true;
                }
              }
            }
          }
        }
      }
      return hit;
    }

    setCameraRelative(cam) {
      this.camera = cam;
    }

    report() {
      //used only for debugging. Requires browser with JS console
      console.log("x: " + this.x + ", y: " + this.y + ", dx: " +
        this.dx + ", dy: " + this.dy +
        ", speed: " + this.speed +
        ", angle: " + this.moveAngle);
    }
  } // end Sprite class

  class Scene {
    //Scene that encapsulates the animation background
    constructor(width = window.innerWidth, height = window.innerHeight, x = 0, y = 0, color = "lightgray") {
      //determine if it's a touchscreen device
      this.touchable = 'createTouch' in document;
      //dynamically create a canvas element
      this.canvas = document.createElement("canvas");
      this.canvas.style.backgroundColor = color;
      document.body.appendChild(this.canvas);
      this.context = this.canvas.getContext("2d");
      this.setSize(width, height);
      this.setPos(x, y);
      this.canvas.style.backgroundColor = color;
      this.physicsticktime = 40; // time between physics and control ticks, standart 50 for 20tps
    }
    clear() {
      this.context.clearRect(0, 0, this.width, this.height);
    }

    start() {
      //set up keyboard reader if not a touch screen.
      // removed this test as it was breaking on machines with both
      // touch and keyboard input
      //if (!this.touchable){
      this.initKeys();
      document.onkeydown = this.updateKeys;
      document.onkeyup = this.clearKeys;
      //} // end if
      this.prevTime = 0;
      graphicsloop = requestAnimationFrame(_Graphics); // start graphics loop
      this.physicsloop = setInterval(_Pysics, this.physicsticktime); // start physics loop
      document.onmousemove = this.updateMousePos;
      document.mouseClicked = false;
      document.onmousedown = function () {
        this.mouseDown = true;
        this.mouseClicked = true;
      };
      document.onmouseup = function () {
        this.mouseDown = false;
        this.mouseClicked = false;
      };
    }

    stop() {
      cancelAnimationFrame(this.graphicsloop);
      clearInterval(this.physicsloop);
    }

    updateKeys(e) {
      //set current key
      currentKey = e.keyCode;
      //console.log(e.keyCode);
      keysDown[e.keyCode] = true;
    }

    clearKeys(e) {
      currentKey = null;
      keysDown[e.keyCode] = false;
    }

    initKeys() {
      //initialize keys array to all false
      let keyNum;
      for (keyNum = 0; keyNum < 256; keyNum++) {
        keysDown[keyNum] = false;
      } // end for
    }

    setSizePos(width, height, x, y) {
      //convenience function.  Cals setSize and setPos
      this.setSize(width, height);
      this.setPos(x, y);
    }

    setSize(width, height) {
      //set the width and height of the canvas in pixels
      // size = {width:100,height:100}
      this.width = width;
      this.height = height;
      this.canvas.width = this.width;
      this.canvas.height = this.height;
    }

    setPos(left, top) {
      //set the left and top position of the canvas
      //offset from the page
      // pos = {x:100,y:100}
      this.left = left;
      this.top = top;

      //CSS3 transform to move elements.
      //Cross-browser compatibility would be awesome, guys...
      this.canvas.style.MozTransform = "translate(" + left + "px, " + top + "px)";
      this.canvas.style.WebkitTransform = "translate(" + left + "px, " + top + "px)";
      this.canvas.style.OTransform = "translate(" + left + "px, " + top + "px)";

    }

    setBG(color) {
      this.canvas.style.backgroundColor = color;
    }

    updateMousePos(e) {
      this.mouseX = e.pageX;
      this.mouseY = e.pageY;
    }

    hideCursor() {
      this.canvas.style.cursor = "none";
    }
    showCursor() {
      this.canvas.style.cursor = "default";
    }

    //incorporate offset for canvas position
    get MouseX() {
      return document.mouseX - this.left;
    }
    get MouseY() {
      return document.mouseY - this.top;
    }

    get MouseClicked() {
      return document.mouseClicked;
    }

    hide() {
      this.canvas.style.display = "none";
    }
    show() {
      this.canvas.style.display = "block";
    }
  } // end Scene class def

  class Sound {
    constructor(src) {
      //sound effect class
      //builds a sound effect based on a url
      //may need both ogg and mp3.
      this.snd = document.createElement("audio");
      this.snd.src = src;
      //preload sounds if possible (won't work on IOS)
      this.snd.setAttribute("preload", "auto");
      //hide controls for now
      this.snd.setAttribute("controls", "none");
      this.snd.style.display = "none";
      //attach to document so controls will show when needed
      document.body.appendChild(this.snd);
    }
    play() {
      this.snd.play();
    } // end play function

    showControls() {
      //generally not needed.
      //crude hack for IOS
      this.snd.setAttribute("controls", "controls");
      this.snd.style.display = "block";
    } // end showControls

  } // end sound class def

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

  class AnimTimer {
    //special timer for animations
    constructor() {
      this.date = new Date();
      this.lastTime = 0;
      this.currentTime = 0;
    }
    start() {
      this.currentTime = Date.now();
    }
    reset() {
      this.currentTime = Date.now();
    }
    getTimeElapsed() {
      this.lastTime = this.currentTime;
      this.currentTime = Date.now();
      return (this.currentTime - this.lastTime);
    }
  }

  /* tile and event stuff added by Tyler */

  class GameButton {
    /*
	This object creates a button that can be sized
	and positioned wherever you wish. The label will
	be displayed, but can be complete HTML (including
	an image tag if you wish.)  Use isClicked() to
	get the current status of the button (true or false.)
	Responds to touch events on mobile devices.
    */
    constructor(label) {
      this.clicked = false;
      this.button = document.createElement("button");
      this.button.setAttribute("type", "button");
      this.button.innerHTML = label;
      this.button.style.position = "absolute";
      this.button.style.left = "0px";
      this.button.style.top = "0px";

      this.button.onmousedown = function () {
        this.clicked = true;
      };
      this.button.ontouchstart = function () {
        this.clicked = true;
      };
      this.button.onmouseup = function () {
        this.clicked = false;
      };

      document.body.appendChild(this.button);
    }

    isClicked() {
      return this.button.clicked;
    }
    setPos(left, top) {
      this.button.style.left = left + "px";
      this.button.style.top = top + "px";
    }
    setPosition(left, top) {
      //utility alias for setPos
      this.setPos(left, top);
    }
    setSize(width, height) {
      this.button.style.width = width + "px";
      this.button.style.height = height + "px";
    }
  } // end gameButton class def

  class Animation {
    //Animation class by Tyler Mitchell
    //for simplicity, all cells must be the same width and height combination
    constructor(spriteSheet, imgWidth, imgHeight, cellWidth, cellHeight) {
      this.sheet = spriteSheet;
      this.imgWidth = imgWidth;
      this.imgHeight = imgHeight;
      this.cellWidth = cellWidth;
      this.cellHeight = cellHeight;
      this.animationLength = 1000;
      this.changeLength = false;
      this.cycles = [];
      this.currentCycleName = "";
      this.currentCycle = null;
      this.cyclePlaySettings = new Array(PLAY_LOOP, PLAY_LOOP, PLAY_LOOP, PLAY_LOOP);
      this.changeAnimation = false;
      this.timer = new AnimTimer();
      this.framesPerRow = 0;
      this.framesPerColumn = 0;
      this.totalCycleTime = 0;
      this.fps = 0;
      this.isPaused = false;
    }
    setup() {
      this.timer.start();
      this.framesPerRow = this.imgWidth / this.cellWidth;
      this.framesPerColumn = this.imgHeight / this.cellHeight;
    }

    addCycle(cycleName, startingCell, frames) {
      let cycle = new Array(cycleName, startingCell, frames);
      this.cycles.push(cycle);
    }

    drawFrame(ctx) { //most of the math in this function could be done only once if we want to make it faster
      this.fps += 1;
      if (!this.isPaused) {
        this.totalCycleTime += this.timer.getTimeElapsed();
      }
      if (this.changeAnimation == true) { // find the correct animation in
        for (i = 0; i < this.cycles.length; i++) {
          if (this.cycles[i][0] == this.currentCycleName) {
            this.currentCycle = this.cycles[i];
          }
        }
      }
      if (this.changeAnimation || this.changeLength) {
        this.frameDelta = this.animationLength / this.currentCycle[2]; // this will be how much time should pass at a minimum before switching to the next frame 
        this.changeAnimation = false;
        this.changeLength = false;
        this.fps = 0;
      }
      //console.log("Cycletime: " + this.totalCycleTime);
      //console.log("Frame Delta: " + this.frameDelta);
      //I think the following line is the trouble spot
      //currentFrame = Math.floor( (this.totalCycleTime % this.animationLength) / this.frameDelta );
      let elTime = this.totalCycleTime % this.animationLength;
      let currentFrame = Math.floor(elTime / this.frameDelta);
      //console.log(elTime);
      //document.getElementById("FPS").innerHTML = this.animationLength;//for debugging
      let row = Math.floor((this.currentCycle[1] + currentFrame) / this.framesPerRow);
      let col = (this.currentCycle[1] + currentFrame) - (row * Math.floor(this.imgWidth / this.cellWidth));
      let frameY = row * this.cellHeight;
      let frameX = col * this.cellWidth;
      ctx.drawImage(this.sheet, frameX, frameY, this.cellWidth, this.cellHeight, 0 - (this.cellWidth / 2), 0 - (this.cellHeight / 2), this.cellWidth, this.cellHeight);
    }
    setCycle(cycleName) {
      this.currentCycleName = cycleName;
      this.changeAnimation = true;
      this.totalCycleTime = 0;
    }
    renameCycles(cycleNames) {
      for (i = 0; i < cycleNames.length; i++) {
        number = parseInt(this.cycles[i][0].slice(5));
        if (this.currentCycleName == this.cycles[i][0]) {
          this.currentCycleName = cycleNames[number - 1];
        }
        this.cycles[i][0] = cycleNames[number - 1];
      }
    }
    play() {
      this.isPaused = false;
      this.timer.reset();
    }
    pause() {
      this.isPaused = true;
    }
    reset() {
      this.totalCycleTime = 0;
      this.timer.reset();
    }
    setAnimationSpeed(animLength) { //animLength is in milliseconds
      if (animLength <= 50) {
        animLength = 50;
      }
      this.animationLength = animLength;
      this.changeLength = true;
    }
  } // end of Animation class

  //keyboard constants
  const K_A = 65;
  const K_B = 66;
  const K_C = 67;
  const K_D = 68;
  const K_E = 69;
  const K_F = 70;
  const K_G = 71;
  const K_H = 72;
  const K_I = 73;
  const K_J = 74;
  const K_K = 75;
  const K_L = 76;
  const K_M = 77;
  const K_N = 78;
  const K_O = 79;
  const K_P = 80;
  const K_Q = 81;
  const K_R = 82;
  const K_S = 83;
  const K_T = 84;
  const K_U = 85;
  const K_V = 86;
  const K_W = 87;
  const K_X = 88;
  const K_Y = 89;
  const K_Z = 90;
  const K_LEFT = 37;
  const K_RIGHT = 39;
  const K_UP = 38;
  const K_DOWN = 40;
  const K_SPACE = 32;
  const K_ESC = 27;
  const K_PGUP = 33;
  const K_PGDOWN = 34;
  const K_HOME = 36;
  const K_END = 35;
  const K_0 = 48;
  const K_1 = 49;
  const K_2 = 50;
  const K_3 = 51;
  const K_4 = 52;
  const K_5 = 53;
  const K_6 = 54;
  const K_7 = 55;
  const K_8 = 56;
  const K_9 = 57;
  //Animation Constants
  const SINGLE_ROW = 1;
  const SINGLE_COLUMN = 2;
  const VARIABLE_LENGTH = 3;
  const PLAY_ONCE = 1;
  const PLAY_LOOP = 2;
  //Boundary action constants
  const WRAP = 0;
  const BOUNCE = 1;
  const STOP = 3;
  const DIE = 4;
  const CONTINUE = 5;

  var fps = 0;
  var prevsec = 0;
  var prevTime = 0;
  var graphicsloop;

  function _Graphics(curTime) { //Dynamic frame clock
    //Allows the browser to determin the desired FPS, based on monitor and system preformance.
    graphicsloop = requestAnimationFrame(_Graphics); //request browser for next frame
    let elapstedtime = curTime - prevTime; // get time in miliseconds since last frame
    prevTime = curTime;
    graphicsupdate(elapstedtime); // request user to update the canvas acording to time passed.

    // debugger for displaying frames per second and seconds per frame.
    if (DEBUG) {
      fps++;
      if (Math.round(curTime / 1000) > prevsec) {
        prevsec = Math.round(curTime / 1000);
        document.getElementById("debugger").innerHTML = `<div>playtime: ${Math.round(curTime / 1000)}</div><div> FPS ${fps}</div>`;
        fps = 0;
      }
    }
  }

  function _Pysics() { //stable physics and control loop runs based on tick time.
    physicsupdate(); // request user to handel physics and controls
  }
//}());