const reverseString = str =>
    str
        .split('')
        .reverse()
        .join('');

console.log(reverseString('Devvrat'));

module.exports = reverseString;
