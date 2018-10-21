const fs = require('fs');
const validate = require('C:\\Users\\sazan\\Desktop\\Универ\\ПСКП\\cwp\\labs\\cwp-06\\api/validation-api');
const error = require('C:\\Users\\sazan\\Desktop\\Универ\\ПСКП\\cwp\\labs\\cwp-06\\api/error-api');

let articles = JSON.parse(fs.readFileSync('articles.json'))['articles'];


exports.readAllArticles = function(req, res, payload, cb) {
    sortArticles(payload);
    cb(null, getPage(payload));
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

function sortArticles(payload) {

    let sortMethod = compareStrings;
    let sortField = payload.sortField || "date";
    let sortOrder = payload.sortOrder || "desc";

    function compareNumbers(a, b) {
        if (Number(a[sortField]) < Number(b[sortField])) return -1;
        if (Number(a[sortField]) > Number(b[sortField])) return 1;
    }

    function compareStrings(a, b) {
        if (a[sortField] < b[sortField]) return -1;
        if (a[sortField] > b[sortField]) return 1;
    }

    function compareDate(a, b) {
        if (Date.parse(a.date) < Date.parse(b.date)) return -1;
        if (Date.parse(a.date) > Date.parse(b.date)) return 1;
    }

    if (sortField === 'date') sortMethod = compareDate;
    if (sortField === 'id') sortMethod = compareNumbers;

    articles = articles.sort(sortMethod);

    if (sortOrder === "desc") {
        articles.reverse();
    }
}

function getPage(payload) {

    let pageNumber = Number(payload.page) || 1;
    let limit = Number(payload.limit) || 10;
    let includeDeps = payload.includeDeps || 'false';

    let page = [];
    let article;

    for (let i = 0; i < limit; i++) {
        article = articles[i + limit * (pageNumber - 1)];
        if (article === undefined) break;
        page[i] = article;
        if (includeDeps === 'false') delete page[i].comments;
    }

    return answer = {
        "items" : page,
        "meta" : {
            "page": pageNumber,
            "pages": Number( (articles.length / limit).toFixed() ) + 1,
            "count": articles.length,
            "limit": limit
        }
    }
}