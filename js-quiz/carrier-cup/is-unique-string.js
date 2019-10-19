const isUnique = str => {
    for (let index = 0; index < str.length; index++) {
        if (index !== str.indexOf(str[index])) return false;
    }
    return true;
};

console.log(isUnique('abcde'));
console.log(isUnique('abcdea'));
