let arr = ['nap', 'teachers', 'cheaters', 'PAN', 'ear', 'era', 'hectares'];

function aclean1(stringArray) {
    const arr = [...stringArray];
    for (let i = 0; i < arr.length; i++) {
        arr[i] = [...arr[i]]
            .sort((a, b) => a > b)
            .join('')
            .toLowerCase();
    }
    console.log(arr);

    arr.forEach((word, index, array) => {
        if (array.indexOf(word) === index) {
            console.log(stringArray[index]);
        }
    });

    return stringArray;
}

// efficient way
function acleanMap(wordArray) {
    const uniqueMap = new Map();

    for (const word of wordArray) {
        let sortedWord = word
            .toLowerCase()
            .split('')
            .sort()
            .join('');

        uniqueMap.set(sortedWord, word);
    }

    return Array.from(uniqueMap.values());
}

function acleanObj(arr) {
    let obj = {};

    for (let i = 0; i < arr.length; i++) {
        let sorted = arr[i]
            .toLowerCase()
            .split('')
            .sort()
            .join('');
        obj[sorted] = arr[i];
    }

    return Object.values(obj);
}

console.log(acleanMap(arr)); // "nap,teachers,ear" or "PAN,cheaters,era"
console.log(acleanObj(arr)); // "nap,teachers,ear" or "PAN,cheaters,era"
