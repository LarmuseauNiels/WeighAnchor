const TileMap = ((() => {
  class TileMap {
    constructor(
      source,
      output,
      tileWidth,
      tileHeight,
      offsetTop,
      offsetRight,
      offsetBottom,
      offsetLeft
    ) {
      // input image
      this.source = source[0] || source;

      offsetTop = parseInt(offsetTop, 10) || 0;
      offsetBottom = parseInt(offsetBottom, 10) || 0;
      offsetLeft = parseInt(offsetLeft, 10) || 0;
      offsetRight = parseInt(offsetRight, 10) || 0;

      // input memory canvas
      this.input = document.createElement('canvas');
      this.input.width = this.source.width - offsetLeft - offsetRight;
      this.input.height = this.source.height - offsetTop - offsetBottom;
      this.inputCtx = this.input.getContext('2d');
      this.inputCtx.drawImage(this.source, 0 - offsetLeft, 0 - offsetTop);

      // output canvas
      this.output = output[0] || output;
      this.output.width = this.input.width;
      this.output.height = this.input.height;
      this.output.style.width = `${this.input.width}px`;
      this.output.style.height = `${this.input.height}px`;
      this.outputCtx = this.output.getContext('2d');

      // tile metrics
      this.tileWidth = tileWidth;
      this.tileHeight = tileHeight;

      $('#tiles .select').css({
        width: `${this.tileWidth}px`,
        height: `${this.tileHeight}px`
      });

      this.getTiles();

      TileMap.createDebugTiles(this.tiles);
      TileMap.debugMapCode(this.map);

      this.cursor = { x: -1, y: -1 };

      this.brush = -1;

      this.marchingAntsOffset = 0;

      const self = this;
      $(this.output).on('mousemove', this.updateCursor.bind(this));
      $(this.output).on('mousedown', () => {
        self.mouseDown = true;
        self.cursorStart = { x: self.cursor.x, y: self.cursor.y }
      }).on('mouseup', () => {
        self.mouseDown = false;
        if (self.brush < 0) {
          self.copySection();
        }
      });
      this.dirty = true;
      this.update();

      $('#tiles').on('click', 'img, span', this.selectBrush.bind(this));

      $('#code').on('keyup click', this.parseCode.bind(this));
    }

    parseCode() {
      const newMap = JSON.parse($('#code').val());
      console.log(newMap);
      if (Array.isArray(newMap) && newMap.length === this.map.length && Array.isArray(newMap[0]) && newMap[0].length === this.map[0].length) {
        this.map = newMap;
        this.dirty = true;
      }
    }

    copySection() {
      const canvas = document.getElementById('clipboard');
      const ctx = canvas.getContext('2d');
      const selection = {
        x: this.cursorStart.x * this.tileWidth,
        y: this.cursorStart.y * this.tileHeight,
        width: Math.round((this.cursor.x - (this.cursorStart.x - (this.cursor.x >= this.cursorStart.x ? 1 : 0))) * this.tileWidth),
        height: Math.round((this.cursor.y - (this.cursorStart.y - (this.cursor.y >= this.cursorStart.y ? 1 : 0))) * this.tileHeight)
      };

      canvas.width = selection.width;
      canvas.height = selection.height;

      const selectionImageData = this.inputCtx.getImageData(selection.x, selection.y, selection.width, selection.height);
      ctx.putImageData(selectionImageData, 0, 0);

      const tiles = [];
      let yy = 0;
      let x;
      let y;
      for (y = this.cursorStart.y; y <= this.cursor.y; y++) {
        tiles[yy] = [];
        for (x = this.cursorStart.x; x <= this.cursor.x; x++) {
          tiles[yy].push(this.map[y][x]);
        }
        yy++;
      }

      this.createTile(canvas, tiles);
    }

    selectBrush({ currentTarget }) {
      const $brush = $(currentTarget);
      $('#tiles > *').removeClass('selected');
      $brush.addClass('selected');
      if ($brush.data('tiles')) {
        this.brush = $brush.data('tiles');
      }
      else {
        this.brush = $brush.data('brush');
      }
      this.dirty = true;
    }

    drawBrush(e) {
      if (Array.isArray(this.brush)) {
        let y;
        let x;
        for (y = 0; y < this.brush.length; y++) {
          for (x = 0; x < this.brush[0].length; x++) {
            this.map[y + this.cursor.y][x + this.cursor.x] = this.brush[y][x];
          }
        }
      }
      else if (this.brush >= 0) {
        this.map[this.cursor.y][this.cursor.x] = this.brush;
      }
      this.dirty = true;
      TileMap.debugMapCode(this.map);
    }

    renderCursor() {
      if (this.cursor.x < 0 || this.cursor.y < 0) {
        return;
      }
      if (Array.isArray(this.brush)) {
        this.outputCtx.drawImage(
          $('#tiles img.selected')[0],
          this.cursor.x * this.tileWidth,
          this.cursor.y * this.tileHeight
        );
      }
      else if (this.brush >= 0) {
        this.outputCtx.putImageData(
          this.tilesImageData[this.brush],
          this.cursor.x * this.tileWidth,
          this.cursor.y * this.tileHeight
        );
      }
      else {
        if (this.mouseDown) {
          this.outputCtx.rect(
            (this.cursorStart.x * this.tileWidth) + 0.5,
            (this.cursorStart.y * this.tileHeight) + 0.5,
            Math.round((this.cursor.x - (this.cursorStart.x - (this.cursor.x >= this.cursorStart.x ? 1 : 0))) * this.tileWidth),
            Math.round((this.cursor.y - (this.cursorStart.y - (this.cursor.y >= this.cursorStart.y ? 1 : 0))) * this.tileHeight)
          );
        }
        else {
          this.outputCtx.rect(
            (this.cursor.x * this.tileWidth) + 0.5,
            (this.cursor.y * this.tileHeight) + 0.5,
            this.tileWidth, this.tileHeight
          );
        }
        this.outputCtx.strokeStyle = "#000";
        this.outputCtx.stroke();
        this.outputCtx.strokeStyle = "#fff";
        this.outputCtx.setLineDash([3, 3]);
        this.outputCtx.lineDashOffset = this.marchingAntsOffset;
        this.outputCtx.stroke();
      }
    }

    render() {
      if (this.dirty) {
        this.dirty = false;
        this.renderMap();
        this.renderCursor();
        this.renderGrid();
      }
    }

    update() {
      if (this.mouseDown) {
        this.drawBrush();
      }
      this.render();
      setTimeout(this.update.bind(this), 33); // 30 fps
      // window.requestAnimationFrame(this.update.bind(this)); // full framerate

      this.marchingAntsOffset++;

      if (this.marchingAntsOffset > 16) {
        this.marchingAntsOffset = 0;
      }
    }

    updateCursor({ currentTarget, pageX, pageY }) {
      const offset = $(currentTarget).offset();
      const x = Math.floor((pageX - offset.left) / this.tileWidth);
      const y = Math.floor((pageY - offset.top) / this.tileHeight);
      if (x === this.cursor.x && y === this.cursor.y) {
        return;
      }
      this.cursor.x = x;
      this.cursor.y = y;
      this.dirty = true;
    }

    createTile(canvas, tiles) {
      const container = document.getElementById('tiles');

      const src = canvas.toDataURL();
      const existing = $(`#tiles [src="${src}"]`);
      if (existing.length) {
        existing.trigger('click');
        return;
      }
      const el = document.createElement('img');
      el.src = src;
      el.dataset.tiles = JSON.stringify(tiles);
      container.appendChild(el);
      $(el).trigger('click');
    }

    getTiles() {
      const foundTiles = [];
      const foundTilesImageData = [];
      let x = 0;
      let y = 0;
      const xx = 0;
      let yy = 0;
      let tile;
      let index;
      let tileImageData;

      // map
      this.map = [];

      // temporary canvas for comparing tiles
      const canvas = document.createElement('canvas');
      canvas.width = this.tileWidth;
      canvas.height = this.tileHeight;
      const ctx = canvas.getContext('2d');

      for (y = 0; y < this.input.height; y += this.tileHeight) {
        this.map[yy] = [];
        for (x = 0; x < this.input.width; x += this.tileWidth) {
          tileImageData = this.inputCtx.getImageData(x, y, this.tileWidth, this.tileHeight);
          ctx.putImageData(tileImageData, 0, 0);
          tile = canvas.toDataURL();
          index = foundTiles.indexOf(tile);
          if (index === -1) {
            foundTiles.push(tile);
            foundTilesImageData.push(tileImageData);
          }
          index = foundTiles.indexOf(tile);
          this.map[yy].push(index);
        }
        yy++;
      }

      this.tiles = foundTiles;
      this.tilesImageData = foundTilesImageData;
      this.map = [[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]];
    }

    renderMap() {
      let x = 0;
      let y = 0;
      for (y = 0; y < this.map.length; y++) {
        for (x = 0; x < this.map[0].length; x++) {
          this.outputCtx.putImageData(this.tilesImageData[this.map[y][x]], x * this.tileWidth, y * this.tileHeight);
        }
      }
      this.inputCtx.drawImage(this.output, 0, 0);
    }

    renderGrid() {
      let x = 0;
      let y = 0;

      this.outputCtx.setLineDash([1, 2])
      this.outputCtx.strokeStyle = 'rgba(128,128,128,0.3)';

      for (y = 0; y < this.map.length; y++) {
        this.outputCtx.beginPath();
        this.outputCtx.moveTo(0, y * this.tileHeight + 0.5);
        this.outputCtx.lineTo(this.output.width, y * this.tileHeight + 0.5);
        this.outputCtx.stroke();
      }

      for (x = 0; x <= this.map[0].length; x++) {
        this.outputCtx.beginPath();
        this.outputCtx.moveTo(x * this.tileWidth + 0.5, 0);
        this.outputCtx.lineTo(x * this.tileWidth + 0.5, this.output.height);
        this.outputCtx.stroke();
      }
    }
  }

  TileMap.debugMapCode = map => {
    $('#code').val(JSON.stringify(map));
  };

  TileMap.createDebugTiles = tiles => {
    const container = document.getElementById('tiles');
    tiles.forEach((tile, i) => {
      const el = document.createElement('img');
      el.src = tile;
      el.dataset.brush = i;
      container.appendChild(el);
    });
  };

  return TileMap;
})());

const tilemap = new TileMap($('#source'), $('#map'), 32, 32, 0, 0, 0, 0);
