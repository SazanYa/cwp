const fs = require("fs");

const iteration = process.argv[3] * 1000;
const path = process.argv[2];
const max = 100;

let numbers = [];

setInterval(() => {
    let rand = Math.floor(Math.random() * max);
    numbers.push(rand);
    fs.writeFileSync(path, JSON.stringify(numbers));
}, iteration);
