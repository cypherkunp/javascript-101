const vowels = ['a', 'e', 'i', 'o', 'u'];
const vowelFilter = str => {
    return str
        .split('')
        .filter(letter => !vowels.includes(letter.toLowerCase()))
        .join('');
};

module.exports = vowelFilter;
