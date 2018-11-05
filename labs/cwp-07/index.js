const fs = require('fs');
const http = require('http');
const path = require('path');

const articles = require('./api/articles-api');
const comments = require('./api/comments-api');
const statics = require('./api/statics-api');

const hostname = '127.0.0.1';
const port = 3000;

const handlers = {
    '/api/articles/readall': articles.readAllArticles,
    '/api/articles/read': articles.readArticle,
    '/api/articles/create': articles.createArticle,
    '/api/articles/update': articles.updateArticle,
    '/api/articles/delete': articles.deleteArticle,
    '/api/comments/create': comments.createComment,
    '/api/comments/delete': comments.deleteComment,
    '/api/logs': sendLog,
    '/': statics.getStatics,
    '/index.html': statics.getStatics,
    '/form.html': statics.getStatics,
    '/index.js': statics.getStatics,
    '/form.js': statics.getStatics,
    '/site.css': statics.getStatics,
    '/jquery.js': statics.getStatics,
    '/favicon.ico' : statics.getStatics
};

let logs = JSON.parse(fs.readFileSync('log.json'))['logs'];
let reqBody = [];

const server = http.createServer((req, res) => {
    const handler = getHandler(req.url);
    if (isStatic(req)) {
        handler(req, res);
    } else {
        parseBodyJson(req, (err, payload) => {
            handler(req, res, payload, (err, result) => {
                if (err) {
                    res.statusCode = err.code;
                    res.setHeader('Content-Type', 'application/json');
                    res.setHeader('Access-Control-Allow-Origin', '*');
                    res.end(JSON.stringify(err));

                    log(req, 'FAIL');

                    return;
                }

                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.setHeader('Access-Control-Allow-Origin', '*');
                res.end(JSON.stringify(result));

                log(req, 'SUCCESS');
            });
        });
    }
});

server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});


function getHandler(url) {
    return handlers[url] || notFound;
}

function notFound(req, res, payload, cb) {
    cb({code: 404, message: 'Not found'});
}

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

function log(req, data) {
    logs.push({
        date: (new Date()).toLocaleTimeString(),
        method: req.method,
        url: req.url,
        body: reqBody,
        result: data
    });

    fs.writeFileSync('log.json', JSON.stringify({logs}, '', 3), 'utf8');
}

function sendLog(req, res, payload, cb) {
    fs.readFile('log.json', 'utf8', (err, data) => {
        if (err) throw err;
        cb(null, JSON.parse(data));
    });
}

function isStatic(req) {
    return Boolean(path.extname(req.url)) || req.url === '/';
}