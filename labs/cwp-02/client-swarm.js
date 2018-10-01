const child_process = require('child_process');

if (process.argv.length !== 3) {
    process.exit(-1);
}

for (let i = 0; i < process.argv[2]; i++) {
    const worker = child_process.exec('node client.js', function(err, stdout, stderr) {
        if (err) {
            console.log(err.stack);
            console.log(`Error code: ${err.code}`);
            console.log(`Signal received: ${err.signal}`);
        }
        console.log(`stdout: \n${stdout}`);
        if (stderr.length !== 0) {
            console.log(`stderr: \n${stderr}`);
        }
    });
}
