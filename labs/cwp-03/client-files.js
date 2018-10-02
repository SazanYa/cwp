const net = require('net');
const fs = require('fs');
const path = require('path');
const port = 8124;

const client = new net.Socket();

let files = [];
let fileNumber = 0;

function sendFile(number) {
    if (number < files.length) {
        fs.readFile(files[number], "utf8", function(err, data) {
            if (err) {
                console.log('Error while reading file');
                throw err;
            }

            client.write(`${path.basename(files[number])}\r\n${data}`);
        })
    } else {
        client.destroy();
    }
}

if (process.argv.length < 3) {
    console.log('There are no command-line arguments');
    process.exit(1);
}

process.argv.forEach((value)=>{
    fs.access(value, fs.constants.F_OK, (err) => {
        if (err) {
            console.log(`${value} directory does not exist`);
            process.exit(1);
        }

        // it's file
        if (path.extname(value)) return;

        fs.readdir(value, (err, items) => {
            for (let i = 0; i < items.length; i++) {
                if (path.extname(items[i])) {
                    let file = value + '\\' + items[i];
                    files.push(file);
                }
            }
        });
    });
});


client.setEncoding('utf8');

client.connect(port, function() {
    client.write('FILES');
});

client.on('data', function(data) {
    if (data === 'OK' || 'ACK') {
        sendFile(fileNumber++);
    } else {
        console.log(data);
    }
});

client.on('close', function() {
    console.log('Connection closed');
});

