const WebSocket = require("ws");

const classes = require("./js/serverClasses");

const WebPort = process.env.PORT || 1337;
const WebSocketPort = Number(process.env.WSPORT || 6440);
const ServerIP = process.env.SERVERIP || "localhost";

const ticktime = 25;
const wss = new WebSocket.Server({
    port: WebSocketPort
});
var region;

require("./js/webserver")(ServerIP, WebSocketPort, WebPort);


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
                region.fire(msgobj);
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