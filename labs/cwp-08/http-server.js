const http = require('http');
const net = require('net');
const config = require('./config.json');

const portTCP = config.ports.tcp || 8124;
const portHTTP = config.ports.http || 3000;
const hostname = config.hostname || "127.0.0.1";

const client = new net.Socket();
const handlers = {
    '/workers': getWorkers,
    '/workers/add': addWorker,
    '/workers/remove': removeWorker
};

const server = http.createServer((req, res) => {

    parseBodyJson(req, (err, payload) => {

        let handler = getHandler(req.url);

        console.log(`method: ${req.method}`);
        console.log(`handler: ${handler.name}`);
        console.log(`body:\n${reqBody}`);

        handler(req, res, payload, (err, result) => {
            res.setHeader('Content-Type', 'application/json');

            if (err) {
                res.statusCode = err.code;
                res.end(JSON.stringify(err));
                return;
            }

            res.statusCode = 200;

            client.write(JSON.stringify(result));
            client.on('data', function (data) {
                //console.log(`from TCP-server:\n${data}`);
                res.end(data);
            });
        });
    });

});

client.setEncoding('utf8');
client.connect(portTCP, function (err) {
    if (err) {
        throw err;
    }
});

server.listen(portHTTP, hostname, () => {
    console.log(`Server running at http://${hostname}:${portHTTP}/`);
});

client.on('close', function () {
    console.log('Connection closed');
});


function getHandler(url) {
    return handlers[url] || notFound;
}

let dto = {};

function getWorkers(req, res, payload, cb) {
    dto.action = 'GET';
    cb(null, dto);
}

function addWorker(req, res, payload, cb) {
    if (payload.X !== undefined) {
        dto.X = payload.X.toString();
        dto.action = 'ADD';
        cb(null, dto);
    } else {
        requestInvalid(req, res, payload, cb);
    }
}

function removeWorker(req, res, payload, cb) {
    if (payload.id !== undefined) {
        dto.id = payload.id.toString();
        dto.action = 'REM';
        cb(null, dto);
    } else {
        requestInvalid(req, res, payload, cb);
    }
}

let reqBody = [];

function parseBodyJson(req, cb) {
    let body = [];

    req.on('data', function (chunk) {
        body.push(chunk);
    }).on('end', function () {
        reqBody = body = Buffer.concat(body).toString();
        let params = JSON.parse(body);
        cb(null, params);
    });
}

function notFound(req, res, payload, cb) {
    cb({code: 404, message: 'Not found'});
}

function requestInvalid(req, res, payload, cb) {
    cb({code: 400, message: 'Request invalid'});
}
