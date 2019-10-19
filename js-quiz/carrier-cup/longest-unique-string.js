function longestString(str) {
    let index = 0;
    let longestCount = 0;
    while (index < str.length) {
        let char = str[index];
        if (index === str.indexOf(char)) {
            index++;
        } else {
            str = str.slice(index);
            longestCount = index > longestCount ? index : longestCount;
            index = 0;
        }
    }
    longestCount = index > longestCount ? index : longestCount;

    return longestCount;
}

console.log(longestString('abghkliopabcdabcds'));
