const valid = require("../validation.js");
let films = require("../top250.json");

const invalidRequest = {code: 400, message: 'Invalid request'};

module.exports.readFilm = function (req, res, next) {
    let payload = req.params;
    if (valid.isValid(req.url, payload)) {
        for (let i = 0; i < films.length; i++) {
            if (films[i].id == payload.id) {
                req.result = films[i];
                break;
            }
        }
    } else {
        req.error = invalidRequest;
    }
    next();
};