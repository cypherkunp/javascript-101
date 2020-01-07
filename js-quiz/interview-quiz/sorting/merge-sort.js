function merge(left = [], right = []) {
    const sortedArray = [];
    let leftIndex = 0;
    let rightIndex = 0;

    while (leftIndex < left.length && rightIndex < right.length) {
        if (left[leftIndex] < right[rightIndex]) {
            sortedArray.push(left[leftIndex]);
            leftIndex++;
        } else if (right[rightIndex] < left[leftIndex]) {
            sortedArray.push(right[rightIndex]);
            rightIndex++;
        }
    }

    return [...sortedArray, ...left.slice(leftIndex), ...right.slice(rightIndex)];
}

if (process.env.NODE_ENV === 'test') {
    console.log('Running in test environment');

    module.exports = merge;
}
