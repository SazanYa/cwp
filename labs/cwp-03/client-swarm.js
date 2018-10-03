const child_process = require('child_process');

if (process.argv.length < 3) {
    console.log('Too few command-line arguments');
    process.exit(1);
}

for (let i = 0; i < process.argv[2]; i++) {
    const worker = child_process.exec('node client-files.js D:\\temp D:\\temp\\t1', function(err, stdout, stderr) {
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
