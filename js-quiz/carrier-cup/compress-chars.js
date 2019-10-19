const compressChars = str => {
    let newString = '';
    for (let index = 0; index < str.length; index++) {
        const c = str[index];
        let count = 1;
        while (c === str[index + 1]) {
            count++;
            index++;
        }
        newString += `${c}${count}`;
    }

    return newString;
};

console.log(compressChars('aabcccccaaa')); // a2b1c5a3.
console.log(compressChars('aaabccccaaaaa')); // a3b1c4a5.
