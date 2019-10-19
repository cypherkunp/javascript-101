/*

Check whether a string has same amount of xs and ys

*/

// My solution

function countXO(str) {
    let x = 0;
    let o = 0;

    [...str.toLowerCase()].forEach(c => {
        if (c === 'x') x++;
        else if (c === 'o') o++;
    });

    return x === o;
}

console.log(countXO('XXoo'));
console.log(countXO('XXooo'));
console.log(countXO('XxoO'));

// best solution

function countXOBest(str) {
    let x = (str.match(/x/gi) || []).length;
    let o = (str.match(/o/gi) || []).length;
    return x === o;
}

console.log('---best---');

console.log(countXOBest('XXoo'));
console.log(countXOBest('XXooo'));
console.log(countXOBest('XxoO'));
console.log(countXOBest('XXOO'));
