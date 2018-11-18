const fs = require('fs');
const valid = require('../validation.js');
let films = require('../top250.json');

const invalidRequest = {code: 400, message: 'Invalid request'};

module.exports.createFilm = function (req, res, next) {
    let payload = req.body;
    if (valid.isValid(req.url, payload)) {
        if (isPositionExists(films, payload.position)) {
            updatePositions(films, payload.position);
        } else {
            let maxPosition = getMaxPosition(films);
            if (payload.position - maxPosition > 1) {
                payload.position = maxPosition + 1;
            }
        }
        payload.id = films[films.length - 1].id + 1;
        films.push(payload);
        req.result = payload;
        fs.writeFileSync('top250.json', JSON.stringify(films, '', 3), 'utf8');
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
        if (films[i].position === position) {
            result = true;
            break;
        }
    }
    return result;
}

function updatePositions(films, newPosition) {
    films.forEach(film => {
        if (film.position >= newPosition) {
            film.position++;
        }
    });
}