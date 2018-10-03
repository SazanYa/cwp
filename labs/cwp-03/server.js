const net = require('net');
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

    // logging only client-qa messaging
    if (client.service === 'FILES') return;

    fs.appendFile(`${client.id}.log`, `[${(new Date()).toLocaleTimeString()}]${data}\r\n`, 'utf8', (err) => {
        if (err) throw err;
    });

    if (con) {
        console.log(data);
    }
}

// main problem is
// client_count > server_capacity && file size is too much
const server = net.createServer((client) => {

    identify(client);

    console.log(`Client ${client.id} connected`);

    client.on('data', (data) => {

        let answer;

        if (!client.isFresh) {

            log(client, `client: ${data}`);

            if (client.service === 'QA') {
                client.write(answer = ['yes', 'no'][Math.random() < 0.5 ? 0 : 1]);
                log(client, `server: ${answer}`);
            }

            if (client.service === 'FILES') {

                fs.mkdir(`${dir}\\${client.id}`, (err) => {
                    if (err) {
                        if (err.code === 'EEXIST') {}
                        else {
                            console.log('Error while creating directory');
                            throw err;
                        }
                    }

                    let meta = data.split('\r\n');
                    let file = [meta.shift(), meta.join('\r\n')];

                    fs.writeFile(`${dir}\\${client.id}\\${file[0]}`, file[1], (err) => {
                        if (err) {
                            console.log('Error while writing file');
                            throw err;
                        }
                        client.write('OK');
                    });
                });
            }
        } else {
            if (data === 'QA' || data === 'FILES') {

                if (data === 'FILES' && ++client_count > server_capacity) {
                    client.end('Exceeded the maximum number of connections ');
                    return;
                }

                client.write(answer = 'ACK');
                client.isFresh = false;
                client.service = data;

                log(client, `client: ${data}`);

            } else {
                client.end(answer = 'DEC');
            }

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
