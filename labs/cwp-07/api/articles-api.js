const fs = require('fs');
const validate = require('./validation-api');
const error = require('./error-api');

let articlesFile = 'articles.json';
let articles = getArticles(articlesFile);


exports.readAllArticles = function (req, res, payload, cb) {
    let sortedArticles = sortArticles(articles, payload);
    cb(null, getPage(sortedArticles, payload));
};

exports.readArticle = function (req, res, payload, cb) {
    if (validate.isValidId(payload.id)) {
        let index = articles.findIndex(a => a.id === payload.id);
        if (index !== -1) cb(null, articles[index]);
        else error.notFound(req, res, payload, cb);
    } else error.requestInvalid(req, res, payload, cb);
};

exports.createArticle = function (req, res, payload, cb) {
    if (validate.isValidArticle(payload)) {
        payload.id = getId(articles).toString();
        payload.comments = [];
        articles = getArticles(articlesFile);
        articles.push(payload);
        updateJson(articlesFile, { articles });
        cb(null, articles[articles.length - 1]);
    } else error.requestInvalid(req, res, payload, cb);
};

exports.updateArticle = function (req, res, payload, cb) {
    if (validate.isValidId(payload.id)) {
        let index = articles.findIndex(a => a.id === payload.id);
        if (index !== -1) {
            payload.comments = [];
            articles[index] = payload;
            updateJson(articlesFile, { articles });
            cb(null, articles[index]);
        }
        else error.notFound(req, res, payload, cb);
    } else error.requestInvalid(req, res, payload, cb);
};

exports.deleteArticle = function (req, res, payload, cb) {
    if (validate.isValidId(payload.id)) {
        let index = articles.findIndex(a => a.id === payload.id);
        if (index !== -1) {
            let article = articles.splice(index, 1);
            updateJson(articlesFile, { articles });
            cb(null, article);
        }
        else error.notFound(req, res, payload, cb);
    } else error.requestInvalid(req, res, payload, cb);
};

function getLastId(array) {
    return Number(array[array.length - 1].id);
}

function getId(array) {
    return getLastId(array) + 1;
}

function updateJson(path, json) {
    fs.writeFileSync(path, JSON.stringify(json, '', 3), 'utf8');
}

function sortArticles(articles, payload) {

    let sortMethod = compareStrings;
    let sortField = payload.sortField || 'date';
    let sortOrder = payload.sortOrder || 'desc';
    let result;

    function compareNumbers(a, b) {
        if (Number(a[sortField]) < Number(b[sortField])) return -1;
        if (Number(a[sortField]) > Number(b[sortField])) return 1;
    }

    function compareStrings(a, b) {
        if (a[sortField].toUpperCase() < b[sortField].toUpperCase()) return -1;
        if (a[sortField].toUpperCase() > b[sortField].toUpperCase()) return 1;
    }

    function compareDate(a, b) {
        if (Date.parse(a.date) < Date.parse(b.date)) return -1;
        if (Date.parse(a.date) > Date.parse(b.date)) return 1;
    }

    if (sortField === 'date') sortMethod = compareDate;
    if (sortField === 'id') sortMethod = compareNumbers;

    result = articles.slice().sort(sortMethod);

    if (sortOrder === "desc") result.reverse();

    return result;
}

function getPage(articles, payload) {

    let pageNumber = Number(payload.page) || 1;
    let limit = Number(payload.limit) || 10;
    let includeDeps = payload.includeDeps || false;

    let page = [];
    let article;

    for (let i = 0; i < limit; i++) {
        article = articles[i + limit * (pageNumber - 1)];
        if (article === undefined) break;
        article.date = (new Date(article.date)).toLocaleString();
        page[i] = article;
        if (includeDeps === false) delete page[i].comments;
    }

    return {
        items: page,
        meta: {
            page: pageNumber,
            pages: Math.ceil(articles.length / limit),
            count: articles.length,
            limit: limit
        }
    }
}

function getArticles(path) {
    return JSON.parse(fs.readFileSync(path))['articles'];
}