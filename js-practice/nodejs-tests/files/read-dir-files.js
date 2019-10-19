const fs = require('fs');

console.log('Here are the files in the dir: ', __dirname);

fs.readdir(__dirname, 'utf8', (err, files) => {
    if (err) console.log('Error');
    files.forEach(file => console.log(file));
});
