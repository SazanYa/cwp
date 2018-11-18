const fs = require('fs');
const valid = require('../validation.js');
let films = require('../top250.json');

const invalidRequest = {code: 400, message: 'Invalid request'};

module.exports.updateFilm = function (req, res, next) {
    let payload = req.body;
    let updatedFilmIndex;
    if (valid.isValid(req.url, payload)) {
        if ((updatedFilmIndex = getFilmIndexById(films, payload.id)) != -1) {
            if (payload.position !== undefined) {
                if (isPositionExists(films, payload.position)) {
                    updatePositions(films, films[updatedFilmIndex].position, payload.position);
                } else {
                    let maxPosition = getMaxPosition(films);
                    if (payload.position - maxPosition > 1) {
                        payload.position = maxPosition + 1;
                    }
                }
            }
            updateFields(films[updatedFilmIndex], payload);
            fs.writeFileSync('top250.json', JSON.stringify(films, '', 3), 'utf8');
            req.result = films[updatedFilmIndex];
        } else {
            req.error = invalidRequest;
        }

    } else {
        req.error = invalidRequest;
    }
    next();
};

function getMaxPosition(films) {
    let positions = [];
    films.forEach(film => positions.push(film.position));
    return getMaxOfArray(positions);
}

function getMaxOfArray(numArray) {
    return Math.max.apply(null, numArray);
}

function isPositionExists(films, position) {
    let result = false;
    for (let i = 0; i < films.length; i++) {
        if (films[i].position == position) {
            result = true;
            break;
        }
    }
    return result;
}

function getFilmIndexById(films, id) {
    let index = -1;
    for (let i = 0; i < films.length; i++) {
        if (films[i].id == id) {
            index = i;
            break;
        }
    }
    return index;
}

function updateFields(film, payload) {
    if (payload.position !== undefined) {
        film.position = payload.position;
    }
    if (payload.title !== undefined) {
        film.title = payload.title;
    }
    if (payload.rating !== undefined) {
        film.rating = payload.rating;
    }
    if (payload.year !== undefined) {
        film.year = payload.year;
    }
    if (payload.budget !== undefined) {
        film.budget = payload.budget;
    }
    if (payload.gross !== undefined) {
        film.gross = payload.gross;
    }
    if (payload.poster !== undefined) {
        film.poster = payload.poster;
    }
}

function updatePositions(films, oldPosition, newPosition) {
    if (newPosition < oldPosition) {
        films.forEach(film => {
            if (film.position >= newPosition && film.position < oldPosition) {
                film.position++;
            }
        });
    }
    else if (newPosition > oldPosition) {
        films.forEach(film => {
            if (film.position > oldPosition && film.position <= newPosition) {
                film.position--;
            }
        });
    }
}
