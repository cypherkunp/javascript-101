const reverseString = str =>
    str
        .split('')
        .reverse()
        .join('');
const isPalindrome = str => str === reverseString(str);

console.log(`kaoak: ${isPalindrome('kaoak')}`);
console.log(`Devvrat: ${isPalindrome('Devvrat')}`);
console.log(`12321: ${isPalindrome('12321')}`);
