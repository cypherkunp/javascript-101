/*
It returns a new array containing all items from index "start" to "end" (not including "end"). 
Both start and end can be negative, in that case position from array end is assumed.

It works like str.slice, but makes subarrays instead of substrings.
*/

const arr = [1, 2, 3, 4, 5];

arr.slice(0, 1); // this doesnt mutate the array instead returns an array
console.log(arr); // returns > [1,2,3,4,5]

const newArr = arr.slice(0, 2);
console.log(newArr); // [1,2]

const newArr2 = arr.slice(1);
console.log(newArr2); // [2, 3, 4, 5]

// negative indexes
const negArray = arr.slice(-2);
console.log(negArray); // [4,5]
