const fs = require('fs');
const http = require('http');
const art = require('C:\\Users\\sazan\\Desktop\\Универ\\ПСКП\\cwp\\labs\\cwp-06\\api\\articles-api');
const com = require('C:\\Users\\sazan\\Desktop\\Универ\\ПСКП\\cwp\\labs\\cwp-06\\api\\comments-api');

const hostname = '127.0.0.1';
const port = 3000;

const handlers = {
    '/api/articles/readall': art.readAllArticles,
    '/api/articles/read': art.readArticle,
    '/api/articles/create': art.createArticle,
    '/api/articles/update': art.updateArticle,
    '/api/articles/delete': art.deleteArticle,
    '/api/comments/create': com.createComment,
    '/api/comments/delete': com.deleteComment,
    '/api/logs': sendLog
};

let logs = JSON.parse(fs.readFileSync('log.json'))['logs'];
let reqBody = [];

const server = http.createServer((req, res) => {
    parseBodyJson(req, (err, payload) => {
        const handler = getHandler(req.url);

        handler(req, res, payload, (err, result) => {
            if (err) {
                res.statusCode = err.code;
                res.setHeader('Content-Type', 'application/json');
                res.end( JSON.stringify(err) );

                log(req, 'FAIL');

                return;
            }

            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end( JSON.stringify(result) );

            log(req, 'SUCCESS');
        });
    });
});

server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});


function getHandler(url) {
    return handlers[url] || notFound;
}

function notFound(req, res, payload, cb) {
    cb({ code: 404, message: 'Not found'});
}

function parseBodyJson(req, cb) {
    let body = [];

    req.on('data', function(chunk) {
        body.push(chunk);
    }).on('end', function() {
        reqBody = body = Buffer.concat(body).toString();

        let params = JSON.parse(body);

        cb(null, params);
    });
}

function log(req, data) {

    logs.push({
        "date": (new Date()).toLocaleTimeString(),
        "method": req.method,
        "body": reqBody,
        "result": data
    });

    fs.writeFileSync('log.json', JSON.stringify({ "logs": logs }, '', 3), 'utf8');
}

function sendLog(req, res, payload, cb) {
    fs.readFile('log.json', 'utf8', (err, data) => {
        if (err) throw err;
        cb(null, JSON.parse(data));
    });
}


