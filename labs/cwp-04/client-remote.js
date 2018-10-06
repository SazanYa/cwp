const net = require('net');
const port = 8124;

const client = new net.Socket();
const key = 'asd123';


function msleep(n) {
    Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, n);
}

function sleep(n) {
    msleep(n*1000);
}

client.setEncoding('utf8');

client.connect(port, function() {
    client.write('REMOTE');
});

client.on('data', function(data) {
    if (data === 'ACK') {
        client.write('COPY D:\\temp\\1.txt D:\\temp\\cwp-04-server-stuff\\1-copy.txt'); sleep(1);
        client.write(`ENCODE D:\\temp\\1.txt D:\\temp\\cwp-04-server-stuff\\1-encode.txt ${key}`); sleep(1);
        client.write(`DECODE D:\\temp\\cwp-04-server-stuff\\1-encode.txt D:\\temp\\cwp-04-server-stuff\\1-decode.txt ${key}`); sleep(1);
        client.destroy();
    } else {
        console.log(data);
    }
});

client.on('close', function() {
    console.log('Connection closed');
});

