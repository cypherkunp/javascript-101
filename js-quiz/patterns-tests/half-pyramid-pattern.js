function drawHalfPyramid(h) {
    for (let i = 0; i < h; i++) {
        for (let j = 0; j <= i; j++) {
            process.stdout.write('*');
        }
        console.log();
    }
}

function drawHollowHalfPyramid(h) {
    for (let i = 0; i < h; i++) {
        for (let j = 0; j <= i; j++) {
            if (i === 0 || i === h - 1 || j === 0 || j === i) process.stdout.write('*');
            else process.stdout.write(' ');
        }
        console.log();
    }
}

function drawInvertedHalfPyramid(h) {
    for (let i = h; i > 0; i--) {
        for (let j = i; j > 0; j--) {
            process.stdout.write('*');
        }
        console.log();
    }
}

function drawHollowInvertedHalfPyramid(h) {
    for (let i = h; i > 0; i--) {
        for (let j = i; j > 0; j--) {
            if (i === h || i === 1 || j === i || j === 1) process.stdout.write('*');
            else process.stdout.write(' ');
        }
        console.log();
    }
}

console.log('Drawing Solid Half Pyramid >');
drawHalfPyramid(6);
console.log('\nDrawing Hollow Half Pyramid >');
drawHollowHalfPyramid(6);
console.log('\nDrawing Inverted Half Pyramid >');
drawInvertedHalfPyramid(6);
console.log('\nDrawing Hollow Inverted Half Pyramid >');
drawHollowInvertedHalfPyramid(6);
