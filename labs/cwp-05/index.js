const fs = require('fs');
const http = require('http');

const hostname = '127.0.0.1';
const port = 3000;

const handlers = {
    '/api/articles/readall': readAllArticles,
    '/api/articles/read': readArticle,
    '/api/articles/create': createArticle,
    '/api/articles/update': updateArticle,
    '/api/articles/delete': deleteArticle,
    '/api/comments/create': createComment,
    '/api/comments/delete': deleteComment
};

const log_path = 'log.txt';

let articles = [];
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
            updateJson(articles);
        });
    });
});

getArticles(() => {
    server.listen(port, hostname, () => {
        console.log(`Server running at http://${hostname}:${port}/`);
    });
});

function getArticles(cb) {
    fs.readFile("articles.json", "utf8", function(err, data) {
        if (err) throw err;
        articles = JSON.parse(data)['articles'];
        cb();
    });
}

function getHandler(url) {
    return handlers[url] || notFound;
}


function readAllArticles(req, res, payload, cb) {
    cb(null, articles);
}

function readArticle(req, res, payload, cb) {
    if (isValidId(payload.id)) {
        let index = articles.findIndex(a => a.id === payload.id);
        if (index !== -1) cb(null, articles[index]);
        else notFound(req, res, payload, cb);
    } else requestInvalid(req, res, payload, cb);
}

function createArticle(req, res, payload, cb) {
    if (isValidArticle(payload)) {
        payload.id = getId(articles).toString();
        payload.comments = [];
        articles.push(payload);
        cb(null, articles[articles.length - 1]);
    } else requestInvalid(req, res, payload, cb);
}

function updateArticle(req, res, payload, cb) {
    if (isValidId(payload.id)) {
        let index = articles.findIndex(a => a.id === payload.id);
        if (index !== -1) {
            payload.comments = [];
            articles[index] = payload;
            cb(null, articles[index]);
        }
        else notFound(req, res, payload, cb);
    } else requestInvalid(req, res, payload, cb);
}

function deleteArticle(req, res, payload, cb) {
    if (isValidId(payload.id)) {
        let index = articles.findIndex(a => a.id === payload.id);
        if (index !== -1) {
            let article = articles.splice(index, 1);
            cb(null, article);
        }
        else notFound(req, res, payload, cb);
    } else requestInvalid(req, res, payload, cb);
}

function createComment(req, res, payload, cb) {
    if (isValidComment(payload)) {
        let index = articles.findIndex(a => a.id === payload.articleId);
        if (index !== -1) {
            payload.id = getId(articles[index].comments).toString();
            articles[index].comments.push(payload);
            cb(null, payload);
        }
        else notFound(req, res, payload, cb);
    } else requestInvalid(req, res, payload, cb);
}

function deleteComment(req, res, payload, cb) {
    if (isValidId(payload.id) && isValidId(payload.articleId)) {
        let articleIndex = articles.findIndex(a => a.id === payload.articleId);
        let commentIndex = articles[articleIndex].comments.findIndex(c => c.id === payload.id);
        let comment = articles[articleIndex].comments.splice(commentIndex, 1);
        cb(null, comment);
    } else requestInvalid(req, res, payload, cb);
}


function notFound(req, res, payload, cb) {
    cb({ code: 404, message: 'Not found'});
}

function requestInvalid(req, res, payload, cb) {
    cb({ code: 400, message: 'Request invalid'});
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


function getLastId(array) {
    return Number(array[array.length-1].id);
}

function getId(array) {
    return getLastId(array) + 1;
}


// TODO:write to articles.json
function updateJson(articles) {
    let json = { "articles": articles};
    fs.writeFileSync("result.json", JSON.stringify(json, "", 3), "utf8");
}


function log(req, data) {
    fs.appendFileSync(log_path,`[${(new Date()).toLocaleTimeString()}]\r\n${req.method}\r\n${req.url}\r\n${reqBody}\r\n${data}\r\n\r\n`);
}


function isValidComment(data) {
    return (data.articleId !== undefined &&
        data.articleId > 0 &&
        data.text !== undefined &&
        data.date !== undefined &&
        data.author !== undefined);
}

function isValidArticle(data) {
    return (data.title !== undefined &&
        data.text !== undefined &&
        data.date !== undefined &&
        data.author !== undefined);
}

function isValidId(id) {
    return (id !== undefined && Number(id) > 0);
}