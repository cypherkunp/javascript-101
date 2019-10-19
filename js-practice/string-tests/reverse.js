function reverse1(string) {
    return string
        .split('')
        .reverse()
        .join('');
}

function reverse2(string) {
    return [...string].reverse().join('');
}

function reverseTag() {
    return [...arguments[0][0]].reverse().join('');
}

console.log(reverse1('HEllo'));
console.log();
console.log(reverse2('HEllo'));
console.log();
console.log(reverseTag`HEllo`);
