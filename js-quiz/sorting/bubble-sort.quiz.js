/**
 * Programming Quiz: Write a function that bubble sorts an array in both ascending and descending 
 * order based on input.
 * @author devvratshukla.github.com
 */
function bubbleSort(array, isAscendingOrder) {
    let isSorted = false;
    while (!isSorted) {
        isSorted = true;
        for (let i = 0; i < array.length - 1; i++) {
            if (isAscendingOrder) {
                if (array[i] > array[i + 1]) {
                    swap(array, i, i + 1);
                    isSorted = false;
                }
            } else {
                if (array[i] < array[i + 1]) {
                    swap(array, i, i + 1);
                    isSorted = false;
                }
            }
        }
    }
    return array;
}
// arrays are objects in JS and objects are passed as reference.
function swap(array, x, y) {
    let temp = 0;
    temp = array[x];
    array[x] = array[y];
    array[y] = temp;
}

console.log('Sorted array in ascending order is > ' + bubbleSort([1, 6, 2, 7, 3, 4, 7, 8, 5], true));
console.log('Sorted array in descending order is > ' + bubbleSort([1, 6, 2, 7, 3, 4, 7, 8, 5], false));

