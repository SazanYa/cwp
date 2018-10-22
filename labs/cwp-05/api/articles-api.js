const fs = require('fs');
const validate = require('./validation-api');
const error = require('./error-api');

let articles = JSON.parse(fs.readFileSync('articles.json'))['articles'];


exports.readAllArticles = function(req, res, payload, cb) {
    cb(null, articles);
}

exports.readArticle = function(req, res, payload, cb) {
    if (validate.isValidId(payload.id)) {
        let index = articles.findIndex(a => a.id === payload.id);
        if (index !== -1) cb(null, articles[index]);
        else error.notFound(req, res, payload, cb);
    } else error.requestInvalid(req, res, payload, cb);
}

exports.createArticle = function(req, res, payload, cb) {
    if (validate.isValidArticle(payload)) {
        payload.id = getId(articles).toString();
        payload.comments = [];
        articles.push(payload);
        updateJson(articles);
        cb(null, articles[articles.length - 1]);
    } else error.requestInvalid(req, res, payload, cb);
}

exports.updateArticle = function(req, res, payload, cb) {
    if (validate.isValidId(payload.id)) {
        let index = articles.findIndex(a => a.id === payload.id);
        if (index !== -1) {
            payload.comments = [];
            articles[index] = payload;
            updateJson(articles);
            cb(null, articles[index]);
        }
        else error.notFound(req, res, payload, cb);
    } else error.requestInvalid(req, res, payload, cb);
}

exports.deleteArticle = function(req, res, payload, cb) {
    if (validate.isValidId(payload.id)) {
        let index = articles.findIndex(a => a.id === payload.id);
        if (index !== -1) {
            let article = articles.splice(index, 1);
            updateJson(articles);
            cb(null, article);
        }
        else error.notFound(req, res, payload, cb);
    } else error.requestInvalid(req, res, payload, cb);
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
