const Promise = require('bluebird');
const path = require('path');
const fs = Promise.promisifyAll(require('fs'));

const dirs = [
    'dir-1/dir-1-1',
    'dir-1/dir-1-2',
    'dir-1/dir-1-2/dir-1-2-1',
    'dir-2/dir-2-1/dir-2-1-1',
    'dir-2/dir-2-2/dir-2-2-1',
    'dir-2/dir-2-1/dir-2-2-2/dir-2-2-2-1',
    'dir-3/dir-3-1',
    'dir-3',
    'dir-3/dir-3-2/dir-3-2-1',
    'dir-3/dir-3-3/dir-3-3-1'
];

let correctDirs = [];

dirs.forEach((dir) => {
    let path = './temp/';
    dir.split('/')
        .forEach((dir) => {
            path += dir + path.sep;
            if (correctDirs.indexOf(path) < 0)
                correctDirs.push(path);
        })
});


Promise.mapSeries(correctDirs, (path) => {
    return fs.mkdirAsync(path);
});