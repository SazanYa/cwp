module.exports.isValid = function (url, payload) {
    let result = false;
    switch (url) {
        case '/api/films/delete':
            if (payload.id !== undefined && Number(payload.id) >= 0)
                result = true;
            break;
        case '/api/films/create':
            if (payload.title !== undefined && payload.rating !== undefined
                && payload.year !== undefined && payload.budget !== undefined
                && payload.gross !== undefined && payload.poster !== undefined
                && payload.position !== undefined) {
                if (payload.year >= 1895
                    && (payload.budget > 0 || payload.budget === null)
                    && (payload.gross > 0 || payload.gross === null)
                    && (payload.position > 0)) {
                    result = true;
                }
            }
            break;
        case '/api/films/update':
            if (payload.id !== undefined && Number(payload.id) >= 0
                && (payload.year >= 1895 || payload.year === undefined)
                && (payload.budget > 0 || payload.budget === null || payload.budget === undefined)
                && (payload.gross > 0 || payload.gross === null || payload.gross === undefined)
                && (payload.position === undefined || payload.position > 0)) {
                result = true;
            }
            break;
    }

    if (url.indexOf('/api/films/read') !== -1) {
        if (payload.id !== undefined && Number(payload.id) >= 0) {
            result = true;
        }
    }
    console.log(result);
    return result;
};