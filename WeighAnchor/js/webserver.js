const http = require('http');
const fs = require("fs");
const url = require('url');
const path = require('path');

module.exports = function (ServerIP,WebSocketPort,WebPort) {
    console.log("starting webserver");
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
        if (pathName.slice(-1) === "/") {
            pathName += "index.html";
        }
        fs.readFile("./client" + pathName, function (error, data) {
            if (error) {
                res.writeHead(404);
                //res.write(error);
                res.end();
            } else {
                const ext = path.parse(pathName).ext;
                res.writeHead(200, {
                    'Content-Type': mimeType[ext] || 'text/plain'
                });
                if (pathName === "/index.html") {
                    data = data.toString().replace("#ServerIP#", ServerIP).replace("#WebSocketPort#", WebSocketPort);
                }
                res.write(data);
                res.end();
            }
        });
    }).listen(WebPort);
};