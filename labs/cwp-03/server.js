const net = require('net');
const fs = require('fs');
const port = 8124;

let seed = 0;

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

const server = net.createServer((client) => {

    identify(client);

    log(client, `Client ${client.id} connected`, true);

    client.on('data', (data) => {

        let answer;

        log(client, `client: ${data}`);

        if (!client.isFresh) {

            if (client.service === 'QA') {
                client.write(answer = ['yes', 'no'][Math.random() < 0.5 ? 0 : 1]);
            }

            if (client.service === 'FILES') {

            }
            log(client, `server: ${answer}`);
        } else {
            if (data === 'QA' || data === 'FILES') {
                client.write(answer = 'ACK');
                client.isFresh = false;
                client.service = data;
            } else {
                client.end(answer = 'DEC');
            }

            log(client, `server: ${answer}`);
        }
    });

    client.on('end', () => log(client, `Client ${client.id} disconnected`, true));
});

server.listen(port, () => {
    console.log(`Server listening on localhost:${port}`);
});
