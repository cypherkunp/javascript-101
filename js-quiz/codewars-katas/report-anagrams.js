function findAnagrams(strArray) {
    const anagramsIndex = [];
    strArray
        .map(str =>
            str
                .split('')
                .sort()
                .join('')
        )
        .forEach((str, index, array) => {
            const match = [];
            for (const [index, value] of array.entries()) {
                if (str === value) match;
            }
        });
}
