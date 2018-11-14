const net = require('net');
const fs = require('fs');
const child_process = require('child_process');
const config = require('./config.json');

const port = config.ports.tcp || 8124;
const key = 0;
const value = 1;

let seed = 0;
let processes = [];
let workers = [];

const server = net.createServer((client) => {
    identify(client);
    console.log(`Client ${client.id} connected`);

    client.on('data', (data) => {
        console.log(`from HTTP-server:\n${data}\n`);
        let fromHTTP = JSON.parse(data);

        if (fromHTTP.action === 'ADD') {
            let date = new Date();
            let newWorker = {
                id: getId(),
                startedOn: date.toISOString()
            };

            let toHTTP = JSON.stringify(newWorker);
            let filename = getFileName(newWorker);
            let newProcess = child_process.fork('worker.js',
                [filename, Number(fromHTTP.X)]);

            workers.push(newWorker);
            processes.push([newWorker.id, newProcess]);
            console.log(`to HTTP-server:\n${toHTTP}\n`);
            client.write(toHTTP);

        } else if (fromHTTP.action === 'REM') {
            let removedWorker = removeWorker(workers, Number(fromHTTP.id));
            let toHTTP = JSON.stringify(removedWorker);

            if (removedWorker == null) {
                client.write(errorMessage('Worker is not found'));
                return;
            }

            killProcess(processes, Number(fromHTTP.id));
            console.log(`to HTTP-server:\n${toHTTP}\n`);
            client.write(toHTTP);

        } else if (fromHTTP.action === 'GET') {
            workers.forEach((worker) => {
                let file = fs.readFileSync(getFileName(worker));
                worker.numbers = JSON.parse(file);
            });
            client.write(JSON.stringify(workers));
        }
    });

    client.on('end', () => console.log(`Client ${client.id} disconnected`));
});

server.listen(port, () => {
    console.log(`Server listening on localhost:${port}`);
});

function getId() {
    return Date.now() + seed++;
}

function identify(client) {
    client.setEncoding('utf8');
    client.id = getId();
}

function getFileName(worker) {
    return `worker${worker.id}.json`;
}

function killProcess(processes, id) {
    for (let i = 0; i < processes.length; i++) {
        if (processes[i][key] === id) {
            processes[i][value].kill();
            return processes.splice(i, 1);
        }
    }
}

function removeWorker(workers, id) {
    let removed = null;
    for (let i = 0; i < workers.length; i++) {
        if (workers[i].id === id) {
            removed = workers[i];
            removed.numbers = JSON.parse(fs.readFileSync(getFileName(workers[i])));
            workers.splice(i, 1);
            break;
        }
    }
    return removed;
}

function errorMessage(message) {
    return JSON.stringify({err: message});
}
