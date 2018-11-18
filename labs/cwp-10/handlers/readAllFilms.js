const fs = require('fs');
let films = require('../top250.json');

let sortField = 'position';

module.exports.readAll = function (req, res, next) {
    req.result = films.sort(compareNumbers);
    next();
};

function compareNumbers(a, b) {
    if (Number(a[sortField]) < Number(b[sortField])) return -1;
    if (Number(a[sortField]) > Number(b[sortField])) return 1;
}