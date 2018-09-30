const net = require('net');
const fs = require('fs');
const port = 8124;

const client = new net.Socket();

let questions = [];
let questionNumber = 0;

function shuffle(array) {
    let currentIndex = array.length, temporaryValue, randomIndex;

    while (0 !== currentIndex) {

        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }

    return array;
}

function sendQuestion(number) {
    if (number <= questions.length - 1) {
        client.write(questions[number]['q']);
    } else {
        client.destroy();
    }
}

fs.readFile("qa.json", "utf8", function(err, data) {
    if (err) throw err;
    questions = shuffle(JSON.parse(data)['quiz']);
});

client.setEncoding('utf8');

client.connect(port, function() {
    client.write('QA');
});

client.on('data', function(data) {
    if (data === 'DEC') {
        console.log(data);
    } else if (data === 'ACK') {
        sendQuestion(questionNumber);
    } else {

        console.log(questions[questionNumber]['q']);
        console.log(`Server: ${data}`);
        console.log(data === questions[questionNumber]['a'] ? 'Right' : 'Wrong');
        console.log();

        sendQuestion(++questionNumber);
    }
});

client.on('close', function() {
    console.log('Connection closed');
});

