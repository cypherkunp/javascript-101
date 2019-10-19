const isPermutation = (str1, str2) => {
    if (str1.length !== str2.length) return false;

    str1 = [...str1].sort().join('');
    str2 = [...str2].sort().join('');

    if (str1 === str2) return true;
    else return false;
};

console.log(isPermutation('abacd', 'dacab'));
console.log(isPermutation('abcd', 'decd'));
console.log(isPermutation('abcd', 'abcde'));
