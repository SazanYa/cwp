const fs = require('fs');
const validate = require('./validation-api');
const error = require('./error-api');

let articles = JSON.parse(fs.readFileSync('articles.json'))['articles'];


exports.createComment = function(req, res, payload, cb) {
    if (validate.isValidComment(payload)) {
        let index = articles.findIndex(a => a.id === payload.articleId);
        if (index !== -1) {
            payload.id = getId(articles[index].comments).toString();
            articles[index].comments.push(payload);
            updateJson(articles);
            cb(null, payload);
        }
        else error.notFound(req, res, payload, cb);
    } else error.requestInvalid(req, res, payload, cb);
}

exports.deleteComment = function(req, res, payload, cb) {
    if (validate.isValidId(payload.id) && validate.isValidId(payload.articleId)) {
        let articleIndex = articles.findIndex(a => a.id === payload.articleId);
        let commentIndex = articles[articleIndex].comments.findIndex(c => c.id === payload.id);
        let comment = articles[articleIndex].comments.splice(commentIndex, 1);
        updateJson(articles);
        cb(null, comment);
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
    fs.writeFileSync('result.json', JSON.stringify({ articles }, '', 3), 'utf8');
}