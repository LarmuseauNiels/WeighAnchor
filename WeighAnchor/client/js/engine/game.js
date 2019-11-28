var game;
var tilemap;
var socket;
var collor = {
    'red': 0,
    'green': 0,
    'blue': 0,
    'trans': 0.0
};
var playerid;
var playermap;


function init() {
    game = new Scene();
    game.setBG("#ffffff");
    tilemap = new TileMap(game);
    playermap = new Map();
    let tileSymbols = [];
    for (let i = 0; i < 256; i++) {
        tileSymbols.push(i);
    }
    CannonBalls = [];

    tilemap.loadTileSheet(64, 64, 1024, 1024, "tilesheet.png", tileSymbols);

    tilemap.loadMapData([
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 16, 26, 17, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 16, 26, 17, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 16, 26, 23, 94, 29, 0, 0, 0, 0, 0, 0, 0, 1, 7, 2, 0, 0, 0, 0, 0, 0, 20, 94, 21, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 1, 7, 7, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 20, 33, 96, 35, 22, 26, 17, 0, 0, 0, 0, 0, 5, 14, 6, 0, 0, 0, 0, 0, 0, 20, 33, 21, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 5, 15, 9, 3, 0, 0, 16, 26, 26, 31, 26, 26, 31, 23, 32, 32, 32, 32, 33, 22, 17, 0, 0, 1, 7, 12, 15, 6, 0, 0, 0, 0, 0, 16, 23, 35, 21, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 5, 14, 6, 0, 0, 0, 20, 69, 60, 63, 60, 63, 60, 70, 32, 95, 32, 93, 32, 32, 29, 0, 0, 5, 9, 8, 8, 3, 0, 0, 0, 16, 26, 23, 35, 33, 21, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 4, 10, 11, 2, 0, 0, 28, 59, 84, 35, 35, 38, 84, 59, 32, 32, 35, 32, 32, 24, 19, 0, 0, 4, 3, 0, 0, 0, 0, 0, 0, 28, 32, 94, 32, 93, 22, 17, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 15, 11, 7, 26, 23, 62, 35, 85, 85, 85, 32, 61, 32, 35, 36, 38, 32, 21, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 20, 32, 39, 39, 32, 32, 21, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 13, 13, 35, 96, 62, 33, 56, 47, 51, 33, 61, 32, 32, 32, 32, 32, 22, 17, 0, 0, 0, 0, 0, 16, 17, 0, 0, 0, 20, 32, 39, 39, 39, 32, 29, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 13, 32, 32, 32, 59, 35, 32, 57, 36, 35, 59, 96, 93, 32, 35, 32, 32, 29, 0, 0, 0, 0, 16, 23, 21, 0, 0, 0, 20, 32, 56, 50, 39, 32, 29, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 13, 32, 33, 35, 71, 60, 64, 83, 64, 60, 72, 32, 36, 32, 32, 35, 35, 21, 0, 0, 0, 16, 23, 92, 21, 0, 0, 0, 18, 25, 32, 44, 39, 32, 21, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 13, 13, 33, 33, 32, 38, 32, 58, 32, 32, 32, 32, 32, 35, 32, 32, 95, 22, 26, 17, 0, 28, 34, 24, 19, 0, 0, 0, 0, 20, 32, 44, 32, 93, 21, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 12, 13, 32, 32, 32, 32, 35, 96, 44, 32, 32, 38, 32, 32, 32, 32, 32, 36, 32, 35, 21, 0, 20, 94, 29, 0, 0, 0, 0, 0, 28, 32, 44, 96, 32, 21, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 10, 13, 13, 13, 33, 32, 35, 32, 44, 32, 32, 32, 34, 34, 34, 35, 37, 32, 32, 32, 22, 26, 23, 36, 22, 26, 26, 31, 26, 26, 23, 96, 44, 32, 32, 21, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 14, 13, 13, 13, 32, 32, 32, 44, 86, 32, 32, 34, 89, 34, 32, 32, 32, 32, 32, 32, 32, 32, 49, 45, 45, 45, 45, 45, 45, 45, 47, 55, 32, 35, 21, 0, 0, 0, 0, 0, 1, 7, 7, 7, 2, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 13, 13, 13, 13, 32, 35, 37, 44, 32, 32, 32, 34, 34, 34, 32, 32, 92, 32, 32, 38, 38, 32, 44, 32, 32, 96, 32, 32, 32, 32, 44, 84, 35, 37, 29, 0, 0, 0, 0, 0, 4, 8, 10, 15, 6, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 10, 13, 33, 33, 32, 32, 85, 54, 50, 95, 36, 32, 32, 32, 32, 36, 38, 32, 32, 32, 32, 32, 44, 32, 32, 32, 32, 32, 39, 32, 54, 51, 35, 35, 21, 0, 0, 0, 0, 0, 0, 0, 4, 10, 11, 7, 2, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 20, 32, 32, 35, 32, 38, 33, 88, 44, 32, 85, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 44, 36, 32, 32, 32, 32, 32, 32, 35, 35, 35, 35, 22, 17, 0, 0, 0, 0, 0, 0, 0, 5, 13, 13, 6, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 16, 26, 17, 0, 0, 0, 20, 32, 96, 34, 34, 34, 32, 32, 54, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 48, 45, 50, 38, 39, 43, 38, 43, 35, 35, 38, 35, 37, 29, 0, 0, 0, 0, 0, 0, 1, 12, 15, 13, 6, 0, 0, 0, 0, 0, 0],
        [0, 0, 16, 26, 26, 23, 35, 29, 0, 0, 0, 28, 32, 33, 34, 89, 34, 32, 32, 32, 32, 32, 33, 32, 33, 32, 35, 35, 32, 35, 32, 36, 32, 38, 32, 44, 38, 39, 43, 39, 38, 35, 35, 35, 92, 96, 22, 17, 0, 0, 0, 0, 0, 5, 13, 13, 13, 6, 0, 0, 0, 0, 0, 0],
        [0, 0, 20, 36, 95, 32, 32, 21, 0, 0, 0, 20, 32, 32, 34, 34, 34, 32, 37, 32, 32, 32, 33, 32, 32, 38, 32, 33, 36, 32, 95, 32, 32, 32, 32, 57, 88, 39, 36, 35, 43, 35, 32, 38, 35, 35, 36, 22, 17, 0, 0, 0, 1, 12, 13, 15, 14, 6, 0, 0, 0, 0, 0, 0],
        [0, 0, 20, 32, 86, 33, 96, 29, 0, 0, 0, 18, 27, 27, 30, 27, 27, 25, 35, 32, 32, 36, 32, 38, 35, 32, 32, 35, 32, 32, 33, 32, 32, 38, 32, 33, 33, 35, 95, 35, 35, 35, 35, 35, 35, 35, 24, 27, 19, 0, 0, 1, 12, 15, 15, 14, 9, 3, 0, 0, 0, 0, 0, 0],
        [0, 0, 20, 33, 35, 36, 35, 21, 0, 0, 0, 0, 0, 0, 0, 0, 0, 18, 30, 30, 27, 27, 30, 27, 27, 27, 27, 27, 30, 27, 27, 27, 27, 27, 27, 27, 27, 30, 27, 27, 27, 30, 27, 27, 27, 27, 19, 0, 0, 0, 0, 5, 13, 15, 13, 13, 6, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 18, 27, 27, 25, 35, 22, 26, 26, 17, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 13, 13, 9, 8, 3, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 20, 35, 93, 36, 85, 21, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 8, 8, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 18, 27, 27, 25, 32, 29, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 18, 27, 19, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    ]);
    if (DEBUG) {
        var gui = new dat.GUI({
            load: {
                "preset": "Default",
                "closed": false,
                "folders": {
                    "nightfolder": {
                        "preset": "Default",
                        "closed": false,
                        "folders": {}
                    }
                }
            }
        });
        var nightfolder = gui.addFolder('Lighting');
        nightfolder.add(collor, 'red', 0, 255);
        nightfolder.add(collor, 'green', 0, 255);
        nightfolder.add(collor, 'blue', 0, 255);
        nightfolder.add(collor, 'trans', 0, 1);
    }
}

function loaded() {
    socket = new WebSocket(serveraddress);
    socket.onopen = function (event) {
        socketEvents();
        console.log("connected");
        socket.send(JSON.stringify({
            action: "join"
        }));
    };
}

function socketEvents() {
    socket.onmessage = function (event) {
        let msg = JSON.parse(event.data);
        switch (msg.action) {
            case "join":
                connected(msg);
                break;
            case "sync":
                sync(msg);
                break;
            //TODO implement more functions
            default:
                break;
        }
    };
}

function connected(data) {
    playerid = data.player.id;
    //TODO set map
    //tilemap.loadMapData(data.map);


    game.start();
}

function sync(data) {
    let incommingplayers = new Map(data.region.playermap);
    incommingplayers.forEach(function (player, id) {
        if (playermap.has(id)) {
            if (id == playerid) {
                //ignore?
            }
            else {
                if (player.missedTicks == 0) {
                    playermap.get(id).sync(player);
                }
            }
        } else {
            playermap.set(id, new Player(player));
        }
    });
    playermap.forEach(function (player, id) {
        if (!incommingplayers.has(id)) {
            playermap.delete(id);
        }
    });
}

function graphicsupdate(etime) {

    game.clear();
    let context = game.canvas.getContext("2d");
    context.globalCompositeOperation = "source-over";
    tilemap.camera.centerOn(playermap.get(playerid).boat.x, playermap.get(playerid).boat.y); //FIXME: temporary ship following
    tilemap.drawMap();
    playermap.forEach(function (player, id) {
        player.boat.update(etime);
    });
    CannonBalls.forEach(function (cannonball) {
        cannonball.update(etime);
    });
    /* 
    context.globalCompositeOperation = "multiply";
    context.fillStyle = "rgba(" + collor.red + ", " + collor.green + ", " + collor.blue + ", " + collor.trans + ")";
    context.fillRect(0, 0, game.canvas.width, game.canvas.height);
    */
}

function physicsupdate() {
    playermap.get(playerid).boat.checkKeys();
    playermap.forEach(function (player, id) {
        player.boat.checkDrag();
    });
    CannonBalls.forEach(function (cannonball) {
        if (cannonball.speed < 0.2) {
            CannonBalls.splice(CannonBalls.indexOf(cannonball), 1);
        }
        cannonball.checkDrag();
    });
    tilemap.checkCollisions(playermap.get(playerid).boat);
    moveSync();
    if (DEBUG) shipdebugger(playermap.get(playerid).boat);
}

function moveSync() {
    socket.send(JSON.stringify({
        action: "moveSync",
        player: playermap.get(playerid)
    }));
}

function shipdebugger(ship) {
    document.getElementById("shipdebugger").innerHTML = "<div>speed: " + Math.round(ship.speed * 100, 2) / 100 + "</div>" + "<div>coordinates: " + Math.round(ship.x * 100, 2) / 100 + " ; " + Math.round(ship.y * 100, 2) / 100 + "</div>";
}