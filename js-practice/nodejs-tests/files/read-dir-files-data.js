const fs = require('fs');

fs.readdir(__dirname, null, (err, files) => {
    if (err) {
        console.log('Some error occured', err);
        return;
    }
    files.forEach(file => {
        fs.readFile(__dirname + '/' + file, 'utf8', (err, data) => {
            if (err) {
                console.log('Some error occured', err);
                return;
            }
            console.log();
            console.log(file, ': Contents');
            console.log(data);
        });
    });
});
