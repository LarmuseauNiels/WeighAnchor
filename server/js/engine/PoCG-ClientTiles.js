/*
Piece Of Cake Gaming Client tiles module!
Author: Niels Larmuseau
*/

class Tile {
  constructor(mapX, mapY, x, y, type) {
    this.x = x;
    this.y = y;
    this.mapX = mapX;
    this.mapY = mapY;
    this.isCollidable = false;
    this.collisionCallback = false;
    this.type = type;
    this.isCollidable = false;
  }

  setCollision(callBack) {
    this.collisionCallback = callBack;
    this.isCollidable = true;
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

  setPosition() {}
}