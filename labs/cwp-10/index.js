const express = require('express');
const bodyParser = require('body-parser');

const readAll = require('./handlers/readAllFilms.js').readAll;
const readFilm = require('./handlers/readFilm.js').readFilm;
const createFilm = require('./handlers/createFilm.js').createFilm;
const updateFilm = require('./handlers/updateFilm.js').updateFilm;
const deleteFilm = require('./handlers/deleteFilm.js').deleteFilm;

const app = express();

const send = (req, res) => {
    if (req.error) {
        res.json(req.error);
    } else {
        res.json(req.result);
    }
};

app.use(bodyParser.json());

app.get('/api/films/readall', readAll, send);
app.get('/api/films/read/:id', readFilm, send);

app.post('/api/films/create', createFilm, send);
app.post('/api/films/update', updateFilm, send);
app.post('/api/films/delete', deleteFilm, send);

app.listen(3000, () => {
    console.log('Server listening on port 3000');
});