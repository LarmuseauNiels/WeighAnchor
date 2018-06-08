'use strict';

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
        window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame']
            || window[vendors[x] + 'CancelRequestAnimationFrame'];
    }

    if (!window.requestAnimationFrame)
        window.requestAnimationFrame = function (callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function () { callback(currTime + timeToCall); },
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
    constructor(scene, imageFile, width, height, x = 200,y=200) {
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
    set image(imgFile) {this._image.src = imgFile;} 

    set position(pos) {
        //position is position of center
        //pos = {x:0,y:0}
        this._x = pos.x;
        this._y = pos.y;
    }
    get position(){return {x: this._x,y: this._y}}

    set x(nx) {this._x = nx;}
    get x() {return this._x}
    set y(ny) {this._y = ny;}
    get y() {return this._y}

    set dx(ndx) {this._dx = ndx;}
    get dx() {return this._dx;}
    set dy(ndy) {this._dy = ndy;}
    get dy() {return this._dy;}

    set boundAction(action) {this._boundAction = action;} 
    get boundAction() {return this._boundAction;} 

    hide() {this.visible = false;}
    show() {this.visible = true;}

    //THIS.animation feaders
    renameCycles(cycleNames){this.animation.renameCycles(cycleNames);}
    specifyCycle(cycleName, startingCell, frames){ this.animation.addCycle(cycleName, startingCell, frames); }
    specifyState(stateName, cellName){ this.animation.addCycle(stateName, cellName, 1); }
    set CurrentCycle(cycleName){ this.animation.setCycle(cycleName); }
    pauseAnimation(){ this.animation.pause(); }
    playAnimation(){ this.animation.play(); }
    resetAnimation(){ this.animation.reset(); }
    set animationSpeed(speed){ this.animation.setAnimationSpeed(speed);}

    calcVector(){
        //used throughout speed / angle calculations to 
        //recalculate dx and dy based on speed and angle
        this._dx = this._speed * Math.cos(this._moveAngle);
        this._dy = this._speed * Math.sin(this._moveAngle);
    } 

    calcSpeedAngle(){
        //opposite of calcVector:
        //sets speed and moveAngle based on dx, dy
        this._speed = Math.sqrt((this._dx * this._dx) + (this._dy * this._dy));
        this._moveAngle = Math.atan2(this._dy, this._dx);
    }

    set speed(speed) {
        this._speed = speed;
        this.calcVector();
    }
    get speed() {return this._speed}

    calcSpeed(){
        //calculate speed based on current dx and dy
        let speed = Math.sqrt((this._dx * this._dx) + (this._dy * this._dy));
        return speed;
    }

    set imgAngle (degrees) {
        //offset degrees by 90
        degrees = degrees - 90;
        //convert degrees to radians
        this._imgAngle = degrees * Math.PI / 180;
    }
    get imgAngle () {
        //imgAngle is stored in radians.
        //return it in degrees
        //don't forget we offset the angle by 90 degrees
        return (this._imgAngle * 180 / Math.PI) + 90;
    }

    set imgAngleSpeed(ias){this._imgAngleSpeed = ias;}
    get imgAngleSpeed() { return this._imgAngleSpeed;}
    
    set moveAngle (degrees) {
        //take movement angle in degrees
        // offset degrees by 90
        degrees = degrees - 90
        //convert to radians
        this._moveAngle = degrees * Math.PI / 180;
        this.calcVector();
    }
    get moveAngle () {
        //moveAngle is stored in radians.return it in degrees
        //don't forget we offset the angle by 90 degrees
        return (this._moveAngle * 180 / Math.PI) + 90;
    }
  
    set moveAngleSpeed(mas){this._moveAngleSpeed = mas;}
    get moveAngleSpeed(){return this._moveAngleSpeed;}
    
    //convenience functions combine move and img angles
    set angle (degrees) {
        this.moveAngle = (degrees);
        this.imgAngle = (degrees);
    } 
    changeAngleBy (degrees) {
        this.changeMoveAngleBy(degrees);
        this.changeImgAngleBy(degrees);
    } 
    turnBy (degrees) {this.changeAngleBy(degrees);}//same as changeAngleBy
    set angleSpeed(as){
        this.moveAngleSpeed = as;
        this.imgAngleSpeed = as;
    }
    changeAngleSpeedBy(asby){
        this.moveAngleSpeed += as;
        this.imgAngleSpeed += as;
    }

    // adding vectors allows a simple way of having linear momentum    
    addVector (degrees, thrust) {
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

    collidesWith (sprite) {// main way to do collision detection
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

    distanceTo (sprite) {
        diffX = this._x - sprite.x;
        diffY = this._y - sprite.y;
        dist = Math.sqrt((diffX * diffX) + (diffY * diffY));
        return dist;
    } 

    angleTo (sprite) { //aims sprite towards sprite
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
        }
        else {
            ctx.drawImage(this._image,
                0 - (this.width / 2),
                0 - (this.height / 2),
                this.width, this.height);
        }
        ctx.restore();
    } 

    update() {// Depricated Pls give elapsed time from graphics loop.
        this._imgAngle += this._imgAngleSpeed;
        this._moveAngle += this._moveAngleSpeed;
        this._x += this._dx;
        this._y += this._dy;
        this.checkBounds();
        if (this.visible) {this._draw();} // end if
    } 

    update(etime) {// moves the sprite based on the time since last frame, use in graphics update
        this._imgAngle += ((this._imgAngleSpeed / 50) * etime);
        this._moveAngle += ((this._moveAngleSpeed / 50) * etime);
        this._x += ((this._dx / 50) * etime);
        this._y += ((this._dy / 50) * etime);
        this.checkBounds();
        if (this.visible) {this._draw();} // end if
    } 

    checkBounds() {
        //behavior changes based on
        //boundAction property
        let camX = 0;
        let camY = 0;
        if (this.camera) { camX = this.camera.cameraOffsetX; camY = this.camera.cameraOffsetY; }
        let rightBorder = this.cWidth + camX;
        let leftBorder = camX;
        let topBorder = camY;
        let bottomBorder = this.cHeight + camY;

        let offRight = false;
        let offLeft = false;
        let offTop = false;
        let offBottom = false;
        if (this.x > rightBorder) {offRight = true;}
        if (this.x < leftBorder) {offLeft = true;}
        if (this.y > bottomBorder) {offBottom = true;}
        if (this.y < 0) {offTop = true;}
        if (this.boundAction == WRAP) {
            if (offRight) {this.x = leftBorder;} // end if
            if (offBottom) {this.y = topBorder;} // end if
            if (offLeft) {this.x = rightBorder;} // end if
            if (offTop) {this.y = bottomBorder;}
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
            if (offLeft || offRight || offTop || offBottom) {this.speed = 0;}
        } else if (this.boundAction == DIE) {
            if (offLeft || offRight || offTop || offBottom) {
                this.hide();
                this.speed = 0;
            }
        } else { /*keep on going forever*/}
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
            if (slicingFlag == SINGLE_COLUMN) { numCycles = (iHeight / cHeight) / framesArray; }
            else if (typeof slicingFlag == "undefined") { numCycles = (iHeight / cHeight); framesArray = iWidth / cWidth; }
            else { numCycles = (iWidth / cWidth) / framesArray; }
            for (i = 0; i < numCycles; i++) {
                cycleName = "cycle" + (i + 1);
                this.specifyCycle(cycleName, i * framesArray, framesArray);
            }
        }
        else {
            numCycles = framesArray.length;
            for (i = 0; i < numCycles; i++) {
                cycleName = "cycle" + (i + 1);
                this.specifyCycle(cycleName, nextStartingFrame, framesArray[i]);
                nextStartingFrame += framesArray[i];
            }
        }
        this.CurrentCycle = "cycle1";
    }

    isMouseDown () {
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

    setCameraRelative (cam) { this.camera = cam; }

    report () {
        //used only for debugging. Requires browser with JS console
        console.log("x: " + this.x + ", y: " + this.y + ", dx: "
            + this.dx + ", dy: " + this.dy
            + ", speed: " + this.speed
            + ", angle: " + this.moveAngle);
    }
} // end Sprite class

class Scene {
    //Scene that encapsulates the animation background
    constructor(width=800,height=600,x=10,y=10,color="lightgray"){
        //determine if it's a touchscreen device
        this.touchable = 'createTouch' in document;
        //dynamically create a canvas element
        this.canvas = document.createElement("canvas");
        this.canvas.style.backgroundColor = color;
        document.body.appendChild(this.canvas);
        this.context = this.canvas.getContext("2d");
        this.setSize(width,height);
        this.setPos(x,y);
        this.canvas.style.backgroundColor = color;
        this.physicsticktime = 40;// time between physics and control ticks, standart 50 for 20tps
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
        graphicsloop = requestAnimationFrame(_Graphics);// start graphics loop
        this.physicsloop = setInterval(_Pysics, this.physicsticktime);// start physics loop
        document.onmousemove = this.updateMousePos;
        document.mouseClicked = false;
        document.onmousedown = function () {
            this.mouseDown = true;
            this.mouseClicked = true;
        }
        document.onmouseup = function () {
            this.mouseDown = false;
            this.mouseClicked = false;
        }
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

    setSizePos(width,height, x,y) {
        //convenience function.  Cals setSize and setPos
        this.setSize(width,height);
        this.setPos(x,y);
    } 

    setSize(width,height) {
        //set the width and height of the canvas in pixels
        // size = {width:100,height:100}
        this.width = width;
        this.height = height;
        this.canvas.width = this.width;
        this.canvas.height = this.height;
    } 

    setPos(left,top) {
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

    hideCursor() {this.canvas.style.cursor = "none";}
    showCursor() {this.canvas.style.cursor = "default";}

    //incorporate offset for canvas position
    get MouseX() { return document.mouseX - this.left;}
    get MouseY() {return document.mouseY - this.top;}

    get MouseClicked() { return document.mouseClicked;}

    hide() {this.canvas.style.display = "none";}
    show() {this.canvas.style.display = "block";}
} // end Scene class def

class Sound {
    constructor(src){
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

class Joy {
    //virtual joystick for ipad
    //console.log("joystick created");
    //when activated, document will have the following properties
    //mouseX, mouseY: touch read as mouse input
    //diffX, diffY: touch motion read as a joystick input
    //if virtKeys is set true
    //joystick inputs will be read as arrow keys
    constructor(){
        this.SENSITIVITY = 50;
        this._diffX = 0;
        this._diffY = 0;
        this.touches = [];
        this.startX;
        this.startY;
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
        let result = "move: "
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
            if (this._diffX > THRESHHOLD) {keysDown[K_RIGHT] = true;} 
            else {keysDown[K_RIGHT] = false;}
            if (this._diffX < -THRESHHOLD) { keysDown[K_LEFT] = true;}
            else {keysDown[K_LEFT] = false;}
            if (this._diffY > THRESHHOLD) {keysDown[K_DOWN] = true;}
            else {keysDown[K_DOWN] = false;} 
            if (this._diffY < -THRESHHOLD) {keysDown[K_UP] = true;} 
            else {keysDown[K_UP] = false;} 
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
        if (this._diffX == null) {this._diffX = 0;} 
        return this._diffX;
    }
    get diffY() {
        //compensate for possible null
        if (this._diffY == null) {this._diffY = 0;} 
        return this._diffY;
    }

    get mouseX() { return this._mouseX; }
    get mouseY() { return this._mouseY; }
} // end joy class def

class Accel {
    constructor(){
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
    onDeviceMotion (event){
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
        if (window.ax == null) {window.ax = 0;}
        return window.ax;
    }
    get AY() {
        if (window.ay == null) {window.ay = 0;}
        return window.ay;
    }
    get AZ () {
        if (window.az == null) {window.az = 0;}
        return window.az;
    }
    get RotX() { return rotX; }
    get RotY() { return rotY; }
    get RotZ() { return rotZ; }
} // end class def

class Timer {
    //simple timer
    constructor(){
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
    start(){this.reset()};
    getTimeElapsed(){this.getElapsedTime()};
} // end Timer def

class AnimTimer {
    //special timer for animations
    constructor(){
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
    getTimeElapsed(){
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
    constructor(label){
        this.clicked = false;
        this.button = document.createElement("button");
        this.button.setAttribute("type", "button");
        this.button.innerHTML = label;
        this.button.style.position = "absolute";
        this.button.style.left = "0px";
        this.button.style.top = "0px";

        this.button.onmousedown = function () {
            this.clicked = true;
        } 
        this.button.ontouchstart = function () {
            this.clicked = true;
        } 
        this.button.onmouseup = function () {
            this.clicked = false;
        } 

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
    constructor(spriteSheet, imgWidth, imgHeight, cellWidth, cellHeight){
        this.sheet = spriteSheet;
        this.imgWidth = imgWidth;
        this.imgHeight = imgHeight;
        this.cellWidth = cellWidth;
        this.cellHeight = cellHeight;
        this.animationLength = 1000;
        this.changeLength = false;
        this.cycles = new Array();
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

    drawFrame(ctx) {//most of the math in this function could be done only once if we want to make it faster
        this.fps += 1;
        if (!this.isPaused) { this.totalCycleTime += this.timer.getTimeElapsed(); }
        if (this.changeAnimation == true) {// find the correct animation in
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
            if (this.currentCycleName == this.cycles[i][0]) { this.currentCycleName = cycleNames[number - 1]; }
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
    setAnimationSpeed(animLength) {//animLength is in milliseconds
        if (animLength <= 50) { animLength = 50; }
        this.animationLength = animLength;
        this.changeLength = true;
    }
}// end of Animation class

/*
The following classes are experimental, and are not yet
tested for widespread use.
They provide tile-based worlds and a camera
All are by Tyler Mitchell
*/
class Camera {
    constructor(scene){
        this.canvas = scene.canvas;
        this.context = this.canvas.getContext("2d");
        this.cHeight = parseInt(this.canvas.height);
        this.cWidth = parseInt(this.canvas.width);
        this.cameraOffsetX = 0;
        this.cameraOffsetY = 0;
        this.target = false;
        this.waitX = 0;
        this.waitY = 0;
        this.focalPointX = 0;
        this.focalPointY = 0;
    }

    moveCamera(x, y) {
        this.cameraOffsetX += x;
        this.cameraOffsetY += y;
    }

    followSprite(sprite) {// wait rectangle currently not working
        this.target = sprite;
        if (typeof waitX != "undefined") {
            this.waitX = waitX;
            this.waitY = waitY;
        }
    }

    update() {
        // center the camera on the sprite
        this.focalPointX = this.cameraOffsetX + this.cWidth / 2;
        this.focalPointY = this.cameraOffsetY + this.cHeight / 2;
        if (this.target && !this.checkFocusBounds()) {
            this.cameraOffsetX = this.target.x + (this.target.width / 2) - (this.cWidth / 2) + this.waitX;
            this.cameraOffsetY = this.target.y + (this.target.height / 2) - (this.cHeight / 2) + this.waitY;
        }
    }

    checkFocusBounds() {
        let centerX = this.target.x + (this.target.width / 2);
        let centerY = this.target.y + (this.target.height / 2);
        if (Math.abs(this.focalPointX - centerX) >= this.waitX) { return false; }
        if (Math.abs(this.focalPointY - centerY) >= this.waitY) { return false; }
        else { return true; }
    }
}

class Tile {
    constructor(mapX, mapY, x, y, type){
        this.x = x;
        this.y = y;
        this.mapX = mapX;
        this.mapY = mapY;
        this.isCollidable = false;
        this.collisionCallback = false;
        this.type = type;
        this.isAnimated = false;
        this.isCollidable = false;
        this.isClickable = false;
        this.clickCallback = false;
        this.animationPlaying = false;
    }

    setCollision(callBack) {
        this.collisionCallback = callBack;
        this.isCollidable = true;
    }

    setAnimation() {
        this.isAnimated = true;
    }

    setClick(callBack) {
        this.isClickable = true;
        this.clickCallback = callBack;
    }

    checkCollision(sprite, w, h) {
        let shw = sprite.width / 2;
        let shh = sprite.height / 2;
        let scx = sprite.x + shw;
        let scy = sprite.y + shh;
        let thw = w / 2;
        let thh = h / 2;
        let tcx = this.x + thw;
        let tcy = this.y + thh;
        if (Math.abs(scx - tcx) < (thw + shw)) {
            if (Math.abs(scy - tcy) < (thh + shh)) {
                this.collisionCallback(this);
            }
        }
    }
}

class TileMap {
    constructor(scene){
        this.tileSheet = new Image();
        this.tiles = new Array();
        this.symbolImageMap = [];
        this.tileAnimations = new Array();
        this.specificTileAnimations = new Array();
        this.mapData = false;
        this.tileWidth = 0;
        this.tileHeight = 0;
        this.sheetWidth = 0;
        this.sheetHeight = 0;
        this.camera = new Camera(scene);
    }
    loadTileSheet(tileWidth, tileHeight, sheetWidth, sheetHeight, tileSheetin, tileSymbols) {
        this.tileSheet = new Image();
        this.tileSheet.src = tileSheetin;
        this.tileWidth = tileWidth;
        this.tileHeight = tileHeight;
        this.SheetWidth = sheetWidth;
        this.SheetHeight = sheetHeight;
        let numRows = Math.floor(this.SheetWidth / this.tileWidth);
        let numCols = Math.floor(this.SheetHeight / this.tileHeight);
        for (let i = 0; i < numRows; i++) {
            for (let j = 0; j < numCols; j++) {
                if ((i * numCols) + j < tileSymbols.length) {
                    this.symbolImageMap[(i * numCols) + j] = new Array(j * this.tileWidth, i * this.tileHeight, tileSymbols[(i * numCols) + j]);
                }
            }
        }
    }

    loadMapData(mapArray) {// mapArray must be a 2-dimensional Array
        this.mapData = new Array();

        for (let i = 0; i < mapArray.length; i++) {
            this.mapData.push(new Array());
            let temp = new Array();
            for (let j = 0; j < mapArray[i].length; j++) {
                let k = 0;
                let notConverted = true;
                while (notConverted && k < this.symbolImageMap.length) {
                    if (mapArray[i][j] == this.symbolImageMap[k][2]) { this.mapData[i][j] = k; notConverted = false; } // convert tile symbols to integers for faster comparisons
                    k++;
                }
                temp[j] = new Tile(j, i, j * this.tileWidth, i * this.tileHeight, k);// k = tile type
            }
            this.tiles.push(temp)
        }
    }

    drawMap() {//this could be WAY faster
        this.camera.update();
        let ctx = this.camera.context;
        let ilength = this.mapData.length;//faster for now condsidering using reversed for loop instead
        for (let i = 0; i < ilength; i++) {//for each row
            let jlength = this.mapData[i].length//faster for now condsidering using reversed for loop instead
            for (let j = 0; j < jlength; j++) { //for each column of each row
                let drawX = this.tiles[i][j].x - this.camera.cameraOffsetX;
                let drawY = this.tiles[i][j].y - this.camera.cameraOffsetY;
                if (0 < drawX < this.camera.cWidth && 0 < drawY < this.camera.cHeight) {//don't draw any tiles that will not be in the camera's view
                    ctx.save();
                    let sheetX = this.symbolImageMap[this.mapData[i][j]][0];
                    let sheetY = this.symbolImageMap[this.mapData[i][j]][1];
                    ctx.translate(drawX, drawY);
                    if (this.tiles[i][j].animationPlaying) { this.drawTileAnimation(this.tiles[i][j], ctx); }
                    else {
                        ctx.drawImage(this.tileSheet, sheetX, sheetY, this.tileWidth, this.tileHeight, 0, 0, this.tileWidth, this.tileHeight);
                        ctx.restore();
                    }
                }
            }
        }
    }

    addTileCollision(collisionCallback, typeOrX, y) {// accept tile type or coordinates
        if (typeof y == "undefined") { // then the first argument is a tile type
            for (i = 0; i < this.tiles.length; i++) {
                for (j = 0; j < this.tiles[i].length; j++) {
                    if (this.tiles[i][j].type == typeOrX) {
                        this.tiles[i][j].setCollision(collisionCallback);
                    }//end if
                }//end for j
            }//end for i
        }//end if type
        else { // then a tile coordinate was passed in
            this.tiles[typeOrX][y].setCollision(collisionCallback);
        }
    }

    loadCollisionMap(collisionMap) {// tile Symbol and collision Callback - - NOTE: This function will overwrite specific Collision Callbacks
        //convert collisionMap symbols to their associated integers
        for (let l = 0; l < collisionMap.length; l++) {
            let c = 0;
            let notConverted = true;
            while (c < this.symbolImageMap.length && notConverted) {
                if (this.symbolImageMap[c][2] == collisionMap[l][0]) {
                    collisionMap[l][0] = c + 1;
                    notConverted = false;
                }
                c++;
            }
        }
        //set collision callback for each tile
        for (let i = 0; i < this.tiles.length; i++) {
            for (let j = 0; j < this.tiles[i].length; j++) {
                let k = 0;
                let notAssigned = true;
                while (k < collisionMap.length && notAssigned) {
                    if (this.tiles[i][j].type == collisionMap[k][0]) {
                        this.tiles[i][j].setCollision(collisionMap[k][1]);
                        notAssigned = false;
                    }
                    k++;
                }
            }
        }
    }

    mapScroll(dx, dy) { this.camera.moveCamera(dx, dy); }
    cameraFollowSprite(sprite, waitX, waitY) { this.camera.followSprite(sprite, waitX, waitY); }

    loadZOrderMap(zMap) { }

    addTileAnimation(imgWidth, imgHeight, cellWidth, cellHeight, tileName, animSheet) {
        let animation = new Animation(animSheet, imgWidth, imgHeight, cellWidth, cellHeight);
        animation.setup();
        for (let i = 0; i < this.symbolImageMap.length; i++) { // find the tile number that corresponds to the tile name.
            if (this.symbolImageMap[i][2] = tileName) {
                this.tileAnimations[i] = animation;// i = tileNumber, animation
            }
        }
    }

    addSpecificTileAnimation(imgWidth, imgHeight, cellWidth, cellHeight, tileX, tileY, animSheet) {
        let animation = new Animation(animSheet, imgWidth, imgHeight, cellWidth, cellHeight);
        animation.setup();
        this.specificTileAnimations[tileX][tileY] = animation;
    }

    drawTileAnimation(tile, ctx) {
        let notSpecific = true;
        if (typeof this.specificTileAnimations[tile.mapX][tile.mapY] !== 'undefined' && this.specificTileAnimations[tile.mapX][tile.mapY] !== null) {
            notSpecific = false;
            this.specificTileAnimations[tile.mapX][tile.mapY].reset();
            this.specificTileAnimations[tile.mapX][tile.mapY].drawFrame(ctx);
        }
        if (typeof this.tileAnimations[tile.type] !== 'undefined' && this.tileAnimations[tile.type] !== null && notSpecific) {
            this.tileAnimations[tile.type].reset();
            this.tileAnimations[tile.type].drawFrame(ctx);
        }
    }

    playTileAnimation(tile) { tile.animationPlaying = true; }
    stopTileAnimation(tile) { tile.animationPlaying = false; }

    checkCollisions(sprite) { //check for collisions between sprite and tile
        let tileCoordX = Math.floor(sprite.x / this.tileWidth);
        let tileCoordY = Math.floor(sprite.y / this.tileHeight);
        let checkRowsBegin = tileCoordX - 1;
        let checkRowsEnd = tileCoordX + 2;
        let checkColsBegin = tileCoordY - 1;
        let checkColsEnd = tileCoordY + 2;
        if (tileCoordX > -1 && tileCoordY > -1 && tileCoordY < this.mapData.length && tileCoordX < this.mapData[tileCoordY].length) {// if sprite is in a tile
            if (tileCoordX == 0) { checkRowsBegin = 0; }
            if (tileCoordX == (this.mapData[tileCoordY].length - 1)) { checkRowsEnd = this.mapData.length; }
            if (tileCoordY == 0) { checkColsBegin = 0; }
            if (tileCoordY == (this.mapData.length - 1)) { checkColsBegin = this.mapData[tileCoordY].length; }
            for (i = checkColsBegin; i < checkColsEnd; i++) {
                for (j = checkRowsBegin; j < checkRowsEnd; j++) {
                    if (this.tiles[i][j].isCollidable) {
                        this.tiles[i][j].checkCollision(sprite, this.tileWidth, this.tileHeight);
                    }
                }
            }
        }
    }

    makeSpriteMapRelative(sprite) { sprite.setCameraRelative(this.camera); }

    setPosition() { }
}


//keyboard constants
const K_A = 65; const K_B = 66; const K_C = 67; const K_D = 68; const K_E = 69; const K_F = 70; const K_G = 71;
const K_H = 72; const K_I = 73; const K_J = 74; const K_K = 75; const K_L = 76; const K_M = 77; const K_N = 78;
const K_O = 79; const K_P = 80; const K_Q = 81; const K_R = 82; const K_S = 83; const K_T = 84; const K_U = 85;
const K_V = 86; const K_W = 87; const K_X = 88; const K_Y = 89; const K_Z = 90;
const K_LEFT = 37; const K_RIGHT = 39; const K_UP = 38; const K_DOWN = 40; const K_SPACE = 32;
const K_ESC = 27; const K_PGUP = 33; const K_PGDOWN = 34; const K_HOME = 36; const K_END = 35;
const K_0 = 48; const K_1 = 49; const K_2 = 50; const K_3 = 51; const K_4 = 52; const K_5 = 53;
const K_6 = 54; const K_7 = 55; const K_8 = 56; const K_9 = 57;
//Animation Constants
const SINGLE_ROW = 1;const  SINGLE_COLUMN = 2;const  VARIABLE_LENGTH = 3;
const PLAY_ONCE = 1;const  PLAY_LOOP = 2;
//Boundary action constants
const WRAP = 0;const  BOUNCE = 1;const  STOP = 3; const DIE = 4;const  CONTINUE = 5;

var fps = 0;var prevsec = 0;var prevTime = 0;var graphicsloop;
function _Graphics(curTime) {//Dynamic frame clock
    //Allows the browser to determin the desired FPS, based on monitor and system preformance.
    graphicsloop = requestAnimationFrame(_Graphics);//request browser for next frame
    let elapstedtime = curTime - prevTime;// get time in miliseconds since last frame
    prevTime = curTime;
    graphicsupdate(elapstedtime);// request user to update the canvas acording to time passed.

    // debugger for displaying frames per second and seconds per frame.
    fps++;
    if (Math.round(curTime / 1000) > prevsec) {
        prevsec = Math.round(curTime / 1000);
        document.getElementById("debugger").innerHTML = `<div>playtime: ${Math.round(curTime / 1000)}</div><div> FPS ${fps}</div>`;
        fps = 0;
    }
}

function _Pysics() {    //stable physics and control loop runs based on tick time.
    physicsupdate();// request user to handel physics and controls
}