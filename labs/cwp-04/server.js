const net = require('net');
const path = require('path');
const crypto = require('crypto');
const fs = require('fs');
const port = 8124;

const dir = process.env.defdir || 'D:\\temp\\cwp-03-server-stuff';
const server_capacity = process.env.server_capacity || 2;

let seed = 0;
let client_count = 0;

function identify(client) {
    client.setEncoding('utf8');
    client.id = Date.now() + seed++;
    client.isFresh = true;
    client.service = '';
}

function log(client, data, con = false) {
    fs.appendFile(`${client.id}.log`, `[${(new Date()).toLocaleTimeString()}]${data}\r\n`, 'utf8', (err) => {
        if (err) throw err;
    });

    if (con) {
        console.log(data);
    }
}

function qaService(client) {
    let answer = ['yes', 'no'][Math.random() < 0.5 ? 0 : 1];
    log(client, `server: ${answer}`);
    client.write(answer);
}

function filesService(client, data) {
    fs.mkdir(`${dir}\\${client.id}`, (err) => {
        if (err) {
            if (err.code === 'EEXIST') {}
            else {
                log(client, 'server: ERROR: error while creating directory');
                throw err;
            }
        }

        let meta = data.split('\r\n');
        let file = [meta.shift(), meta.join('\r\n')];

        fs.writeFile(`${dir}\\${client.id}\\${file[0]}`, file[1], (err) => {
            if (err) {
                log(client, 'server: ERROR: error while writing file');
                throw err;
            }
            log(client, 'server: OK');
            client.write('OK');
        });
    });
}

function remoteService(client, data) {
    let arguments = data.split(' ');
    let command = arguments.shift();

    if (arguments.length > 3 || arguments.length < 2) {
        log(client, `server: ERROR: ${command} invalid number of arguments`);
        return;
    }

    if (command === 'COPY' || command === 'ENCODE' || command === 'DECODE') {

        fs.access(arguments[0], fs.constants.F_OK, (err) => {
            if (err) {
                log(client, `server: ERROR: ${arguments[0]} file does not exist`);
                return;
            }

            fs.access(path.dirname(arguments[1]), fs.constants.F_OK, (err) => {
                if (err) {
                    log(client, `server: ERROR: ${path.dirname(arguments[1])} directory does not exist`);
                    return;
                }

                const input = fs.createReadStream(arguments[0]);
                const output = fs.createWriteStream(arguments[1]);

                if (command === 'COPY') input.pipe(output);
                if (command === 'ENCODE') {
                    const encode = crypto.createCipher('aes192', arguments[2]);
                    input.pipe(encode).pipe(output);
                }
                if (command === 'DECODE') {
                    const decode = crypto.createDecipher('aes192', arguments[2]);
                    input.pipe(decode).pipe(output);
                }
            });
        });
    }
}

const server = net.createServer((client) => {

    identify(client);

    console.log(`Client ${client.id} connected`);

    client.on('data', (data) => {
        // new client
        if (!client.isFresh) {

            log(client, `client: ${data}`);

            if (client.service === 'QA') qaService(client)
            if (client.service === 'FILES') filesService(client, data);
            if (client.service === 'REMOTE') remoteService(client, data);

        } else {
            let answer;
            if (data === 'QA' || data === 'FILES' || data === 'REMOTE') {

                if (data === 'FILES' && ++client_count > server_capacity) {
                    client.end('ERROR: Exceeded the maximum number of connections');
                    return;
                }

                client.write(answer = 'ACK');
                client.isFresh = false;
                client.service = data;
            } else {
                client.end(answer = 'DEC');
            }

            log(client, `client: ${data}`);
            log(client, `server: ${answer}`);
        }
    });

    client.on('end', () => {
        console.log(`Client ${client.id} disconnected`);
        client_count--;
    });
});

server.listen(port, () => {
    console.log(`Server listening on localhost:${port}`);
});
