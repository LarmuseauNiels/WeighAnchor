const http = require('http');
const WebSocket = require("ws");
const fs = require("fs");
const url = require('url');
const path = require('path');
const WebPort = process.env.PORT || 1337;
const classes = require("./js/serverClasses");
const WebSocketPort = Number(process.env.WSPORT || 6440);
const ServerIP = process.env.SERVERIP || "localhost";
const ticktime = 25;
const wss = new WebSocket.Server({
    port: WebSocketPort
});

var region;

// maps file extention to MIME types
const mimeType = {
    '.ico': 'image/x-icon',
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.json': 'application/json',
    '.css': 'text/css',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.wav': 'audio/wav',
    '.mp3': 'audio/mpeg',
    '.svg': 'image/svg+xml',
    '.pdf': 'application/pdf',
    '.doc': 'application/msword',
    '.eot': 'appliaction/vnd.ms-fontobject',
    '.ttf': 'aplication/font-sfnt'
};

http.createServer(function (req, res) {
    let pathName = url.parse(req.url).pathname;
    if (pathName === "/") {
        pathName = "/index.html";
    }
    //if (fs.statSync(pathName).isDirectory()) {
    //    pathName += '/index.html';
    //}
    fs.readFile("./client" + pathName,  function (error, data) {
        if (error) {
            res.writeHead(404);
            //res.write(error);
            res.end();
        } else {
            const ext = path.parse(pathName).ext;
            res.writeHead(200, {
                'Content-Type': mimeType[ext] || 'text/plain'
            });
            if (pathName === "/index.html" ) {
                data = data.toString().replace("#ServerIP#", ServerIP).replace("#WebSocketPort#", WebSocketPort);
            }
            res.write(data);
            res.end();
        }
    });
}).listen(WebPort);

function loop() {
    wss.broadcast(
        JSON.stringify({
            action: "sync",
            region: region
        })
    );
    region.playermap.forEach(function (player, id) {
        if (player.missedTicks > 50) {
            region.playermap.delete(id);
        }
        else {
            player.missedTicks++;
        }
    });
}

function init() {
    region = new classes.Region(new Map(), new Map());
    clock = setInterval(loop, ticktime);
    initConnection();
}


function initConnection() {
    wss.on("connection", function connection(socket, request) {
        //Player Joining
        socket.on("message", function incoming(msg) {
            msgobj = JSON.parse(msg);
            if (msgobj.action === "ping") {
                //ignore
            } //for testing T001
            //console.log('received: %s', message); // Debugging
            // incomming Action
            switch (msgobj.action) {
            case "ping":
                socket.send(
                    JSON.stringify({
                        action: "ping"
                    })
                );
                break;
            case "join":
                let p1 = region.join();
                socket.send(
                    JSON.stringify({
                        action: "join",
                        player: p1,
                    })
                );
                break;
            case "moveSync":
                let p2 = msgobj.player;
                region.moveSync(p2);
                break;
            case "fire":
                //TODO cannon ball
                break;
            default:
                socket.send(
                    JSON.stringify({
                        action: "error",
                        code: "ER101",
                        comment: "requested action not found"
                    })
                );
                break;
            }
        });
    });
}

wss.broadcast = function broadcast(data) {
    wss.clients.forEach(function each(client) {
        if (client.readyState === WebSocket.OPEN) {
            client.send(data);
        }
    });
};

init();