function drawSolidRectangle(w, h) {
    for (let i = 0; i < h; i++) {
        for (let j = 0; j < w; j++) {
            process.stdout.write('*');
        }
        console.log();
    }
}

function drawHollowRectangle(w, h) {
    for (let i = 0; i < h; i++) {
        for (let j = 0; j < w; j++) {
            i === 0 || i === h - 1 || j === 0 || j === w - 1 ? process.stdout.write('*') : process.stdout.write(' ');
        }
        console.log();
    }
}

drawSolidRectangle(8, 4);
console.log();
drawHollowRectangle(8, 4);
