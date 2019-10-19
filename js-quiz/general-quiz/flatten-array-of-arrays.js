const inputArr = [[1, 2], [3, 4], [5, 6], [3, 4, 5], 9];

const flattenArray = arr => {
    const flatArray = [];
    for (const e of arr) {
        if (Array.isArray(e)) flatArray.push(...e);
        else flatArray.push(e);
    }
    return flatArray;
};

console.log(flattenArray(inputArr));
