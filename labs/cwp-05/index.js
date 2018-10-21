const fs = require('fs');
const http = require('http');
const art = require('C:\\Users\\sazan\\Desktop\\Универ\\ПСКП\\cwp\\labs\\cwp-05\\api\\articles-api');
const com = require('C:\\Users\\sazan\\Desktop\\Универ\\ПСКП\\cwp\\labs\\cwp-05\\api\\comments-api');

const hostname = '127.0.0.1';
const port = 3000;

const handlers = {
    '/api/articles/readall': art.readAllArticles,
    '/api/articles/read': art.readArticle,
    '/api/articles/create': art.createArticle,
    '/api/articles/update': art.updateArticle,
    '/api/articles/delete': art.deleteArticle,
    '/api/comments/create': com.createComment,
    '/api/comments/delete': com.deleteComment
};

const log_path = 'log.txt';

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
    fs.appendFileSync(log_path,`[${(new Date()).toLocaleTimeString()}]\r\n${req.method}\r\n${req.url}\r\n${reqBody}\r\n${data}\r\n\r\n`);
}


