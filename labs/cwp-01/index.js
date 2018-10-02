const fs = require('fs');
const path = require('path');

const argdir = process.argv[2];
const cpydir = argdir + '\\' + path.basename(argdir);

let files = [];
let copyright = null;

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

if (process.argv.length !== 3) {
    console.log('required number of arguments: 1');
    process.exit(1);
}

fs.access(argdir, fs.constants.F_OK, (err) => {
    if (err) {
        console.log(`${argdir} directory does not exist`);
        process.exit(1);
    }
});

fs.readFile("config.json", "utf8", function(err, data) {
    if (err) throw err;
    copyright = JSON.parse(data)['copyright'];
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
        if (eventType === 'change') {
            console.log(filename);
        }
    });

}, 100);



