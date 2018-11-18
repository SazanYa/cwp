const fs = require('fs');
const valid = require('../validation.js');
let films = require('../top250.json');

const invalidRequest = {code: 400, message: 'Invalid request'};

module.exports.deleteFilm = function (req, res, next) {
    let payload = req.body;
    if (valid.isValid(req.url, payload)) {
        let deletedFilmIndex;
        if ((deletedFilmIndex = isFilmExists(films, payload.id)) !== -1) {
            updatePositions(films, films[deletedFilmIndex].position);
            req.result = films[deletedFilmIndex];
            films.splice(deletedFilmIndex, 1);
            fs.writeFileSync('top250.json', JSON.stringify(films, '', 3), 'utf8');
        } else {
            req.error = invalidRequest;
        }
    } else {
        req.error = invalidRequest;
    }
    next();
};

function isFilmExists(films, id) {
    let index = -1;
    for (let i = 0; i < films.length; i++) {
        if (films[i].id === id) {
            index = i;
            break;
        }
    }
    return index;
}

function updatePositions(films, deletedPosition) {
    films.forEach(film => {
        if (film.position > deletedPosition) {
            film.position--;
        }
    });
}