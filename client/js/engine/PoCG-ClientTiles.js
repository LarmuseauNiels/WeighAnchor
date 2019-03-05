/*
Piece Of Cake Gaming Client tiles module!
Author: Niels Larmuseau
*/
class Camera {
  constructor(scene) {
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

  centerOn(x,y){
    this.cameraOffsetX = (x - (this.cWidth / 2)); //+ (this.target.width / 2)
    this.cameraOffsetY = (y - (this.cHeight / 2)); 
  }

  moveBy(x, y) {
    this.cameraOffsetX += x;
    this.cameraOffsetY += y;
  }

  followSprite(sprite) { // wait rectangle currently not working
    this.target = sprite;
    // if (typeof waitX != "undefined") {
    //   this.waitX = waitX;
    //   this.waitY = waitY;
    // }
  }

  update() {
    // center the camera on the sprite
    this.focalPointX = this.cameraOffsetX + this.cWidth / 2;
    this.focalPointY = this.cameraOffsetY + this.cHeight / 2;
    if (this.target && !this.checkFocusBounds()) {
      this.cameraOffsetX = (this.target.x - (this.cWidth / 2)); //+ (this.target.width / 2)
      this.cameraOffsetY = (this.target.y - (this.cHeight / 2)); //+ ((this.target.height / 2)*0)
    }
  }

  checkFocusBounds() {
    let centerX = this.target.x + (this.target.width / 2);
    let centerY = this.target.y + (this.target.height / 2);
    if (Math.abs(this.focalPointX - centerX) >= this.waitX) {
      return false;
    }
    if (Math.abs(this.focalPointY - centerY) >= this.waitY) {
      return false;
    } else {
      return true;
    }
  }
}

class Tile {
  constructor(mapX, mapY, x, y, type) {
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
  constructor(scene) {
    this.tileSheet = new Image();
    this.tiles = [];
    this.symbolImageMap = [];
    this.tileAnimations = [];
    this.specificTileAnimations = [];
    this.mapData = false;
    this.tileWidth = 0;
    this.tileHeight = 0;
    this.sheetWidth = 0;
    this.sheetHeight = 0;
    this.camera = new Camera(scene);

  }
  loadTileSheet(tileWidth, tileHeight, sheetWidth, sheetHeight, tileSheetin, tileSymbols) {
    this.tileSheet = new Image();
    this.tileSheet.onload = function () {
      tilemap.makeMap();
    };
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

  loadMapData(mapArray) { // mapArray must be a 2-dimensional Array
    this.mapData = [];
    for (let i = 0; i < mapArray.length; i++) {
      this.mapData.push([]);
      let temp = [];
      for (let j = 0; j < mapArray[i].length; j++) {
        let k = 0;
        let notConverted = true;
        while (notConverted && k < this.symbolImageMap.length) {
          if (mapArray[i][j] == this.symbolImageMap[k][2]) {
            this.mapData[i][j] = k;
            notConverted = false;
          } // convert tile symbols to integers for faster comparisons
          k++;
        }
        temp[j] = new Tile(j, i, j * this.tileWidth, i * this.tileHeight, k); // k = tile type
      }
      this.tiles.push(temp);
    }

  }

  makeMap() {
    this.virtcanvas = document.createElement("canvas");
    this.virtctx = this.virtcanvas.getContext("2d");
    this.ilength = this.mapData.length;
    this.jlength = this.mapData[1].length;
    this.renderVirtCtx();
    loaded();
  }

  renderVirtCtx(){
    this.virtcanvas.width = this.ilength * 64;
    this.virtcanvas.height = this.jlength * 64;
    for (let i = 0; i < this.ilength; i++) { //for each row
      for (let j = 0; j < this.jlength; j++) { //for each column of each row
        this.virtctx.drawImage(this.tileSheet, this.symbolImageMap[this.mapData[i][j]][0], this.symbolImageMap[this.mapData[i][j]][1], 64, 64, j * 64, i * 64, 64, 64);
      }
    }
  }

  drawMap() {
    
    //this.virtctx.fillRect(512, 320, 64, 64);
    this.camera.update();
    this.camera.context.drawImage(this.virtcanvas, -this.camera.cameraOffsetX, -this.camera.cameraOffsetY);
  }

  addTileCollision(collisionCallback, typeOrX, y) { // accept tile type or coordinates
    if (typeof y == "undefined") { // then the first argument is a tile type
      for (let i = 0; i < this.tiles.length; i++) {
        for (let j = 0; j < this.tiles[i].length; j++) {
          if (this.tiles[i][j].type == typeOrX) {
            this.tiles[i][j].setCollision(collisionCallback);
          } //end if
        } //end for j
      } //end for i
    } //end if type
    else { // then a tile coordinate was passed in
      this.tiles[typeOrX][y].setCollision(collisionCallback);
    }
  }

  loadCollisionMap(collisionMap) { // tile Symbol and collision Callback - - NOTE: This function will overwrite specific Collision Callbacks
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

  mapScroll(dx, dy) {
    this.camera.moveCamera(dx, dy);
  }
  cameraFollowSprite(sprite, waitX, waitY) {
    this.camera.followSprite(sprite, waitX, waitY);
  }

  loadZOrderMap(zMap) {}

  addTileAnimation(imgWidth, imgHeight, cellWidth, cellHeight, tileName, animSheet) {
    let animation = new Animation(animSheet, imgWidth, imgHeight, cellWidth, cellHeight);
    animation.setup();
    for (let i = 0; i < this.symbolImageMap.length; i++) { // find the tile number that corresponds to the tile name.
      if (this.symbolImageMap[i][2] == tileName) {
        this.tileAnimations[i] = animation; // i = tileNumber, animation
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

  playTileAnimation(tile) {
    tile.animationPlaying = true;
  }
  stopTileAnimation(tile) {
    tile.animationPlaying = false;
  }

  checkCollisions(sprite) { //check for collisions between sprite and tile
    let tileCoordX = Math.floor(sprite.x / this.tileWidth);
    let tileCoordY = Math.floor(sprite.y / this.tileHeight);
    let checkRowsBegin = tileCoordX - 1;
    let checkRowsEnd = tileCoordX + 2;
    let checkColsBegin = tileCoordY - 1;
    let checkColsEnd = tileCoordY + 2;
    if (tileCoordX > -1 && tileCoordY > -1 && tileCoordY < this.mapData.length && tileCoordX < this.mapData[tileCoordY].length) { // if sprite is in a tile
      if (tileCoordX == 0) {
        checkRowsBegin = 0;
      }
      if (tileCoordX == (this.mapData[tileCoordY].length - 1)) {
        checkRowsEnd = this.mapData.length;
      }
      if (tileCoordY == 0) {
        checkColsBegin = 0;
      }
      if (tileCoordY == (this.mapData.length - 1)) {
        checkColsBegin = this.mapData[tileCoordY].length;
      }
      for (let i = checkColsBegin; i < checkColsEnd; i++) {
        for (let j = checkRowsBegin; j < checkRowsEnd; j++) {
          if (this.tiles[i][j].isCollidable) {
            this.tiles[i][j].checkCollision(sprite, this.tileWidth, this.tileHeight);
          }
        }
      }
    }
  }

  makeSpriteMapRelative(sprite) {
    sprite.setCameraRelative(this.camera);
  }

  setPosition() {}
}