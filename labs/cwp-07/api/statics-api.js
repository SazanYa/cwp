const mime = require('mime-types');
const fs = require('fs');

const contentTypes = {
    "html": "text/html",
    "css": "text/css",
    "js": "text/plain",
    "json": "application/json",
    "text": "text/plain",
    "ico": "image/x-icon"
};

exports.getStatics = function (req, res) {
    let url = req.url === '/' ? 'index.html' : req.url;
    let path = `./public/${url}`;
    let inputStream = fs.createReadStream(path);

    let types = path.split(".");
    let fileType = types[types.length - 1];

    res.statusCode = 200;
    res.setHeader('Content-Type', contentTypes[fileType]);
    res.setHeader('Access-Control-Allow-Origin', '*');

    inputStream.pipe(res);
}