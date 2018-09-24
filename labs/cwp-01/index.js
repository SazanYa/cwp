const fs = require('fs');
const path = require('path');

if (process.argv.length !== 3) {
    process.exit(-1);
}

function getFiles(p) {
    fs.readdir(p, (err, items) => {
        for (let i = 0; i < items.length; i++) {
            let dir = p + '\\' + items[i];
            if (path.extname(items[i])) {
                files.push(dir);
            }
            else {
                getFiles(dir);
            }
        }
    });
}

let files = [];
let copyright = null;

const argdir = process.argv[2];
const cpydir = argdir + '\\' + path.basename(argdir);

fs.readFile("config.json", "utf8", function(err, data) {
    if (err) throw err;
    copyright = JSON.parse(data)['copyright'];
});

fs.access(argdir, fs.constants.F_OK, (err) => {
    console.log(`${file} ${err ? 'does not exist' : 'exists'}`);
});

getFiles(argdir);

setTimeout(() => {

    // создание директории
    fs.mkdir(cpydir, function(err) {
        if (err) {
            if (err.code === 'EEXIST') return;
            throw err;
        }
    });

    // копирование всех *.txt файлов
    files.forEach((item) => {
        fs.readFile(item, "utf8", function(err, data) {
            if (err) throw err;
            fs.writeFile(cpydir + '\\' + path.basename(item.toString()),
                copyright + '\r\n' + data + '\r\n' + copyright,
                function(err) {
                if (err) throw err;
            });
        });
    });

    // образование относительных путей файлов
    for (let i = 0; i < files.length; i++) {
        files[i] = files[i].replace(argdir + '\\', '');
        files[i] = files[i].replace(/\\/g, '\\\\');
    }

    // создания скрипта с выводом всех файлов
    fs.writeFile(argdir + "\\summary.js", 'console.log(\'' + files.join('\\n') + '\');', (err) => {
        if (err) throw err;
    });

    // отслеживание директории
    fs.watch(cpydir, function(eventType, filename) {
        if (eventType === 'rename') {

        console.log(filename);
        }
    });

}, 500);



