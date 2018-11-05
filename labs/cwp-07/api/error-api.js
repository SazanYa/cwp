
exports.notFound = function(req, res, payload, cb) {
    cb({ code: 404, message: 'Not found'});
}

exports.requestInvalid = function(req, res, payload, cb) {
    cb({ code: 400, message: 'Request invalid'});
}