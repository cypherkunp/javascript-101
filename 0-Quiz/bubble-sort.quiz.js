function bubbleSort(array, isAscendingOrder) {
    let isSorted = false;
    function swap(x, y) {
        let temp = 0;
        temp = array[x];
        array[x] = array[y];
        array[y] = temp;
    }
    while (!isSorted) {
        isSorted = true;
        for (let i = 0; i < array.length - 1; i++) {
            if (isAscendingOrder) {
                if (array[i] > array[i + 1]) {
                    swap(i, i + 1);
                    isSorted = false;
                }
            } else {
                if (array[i] < array[i + 1]) {
                    swap(i, i + 1);
                    isSorted = false;
                }
            }
        }
    }
    return array;
}

console.log('Sorted array in ascending order is > ' + bubbleSort([1, 6, 2, 7, 3, 4, 7, 8, 5], true));
console.log('Sorted array in descending order is > ' + bubbleSort([1, 6, 2, 7, 3, 4, 7, 8, 5], false));

