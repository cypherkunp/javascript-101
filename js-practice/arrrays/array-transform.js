/*

Methods to transform or reorder the array:
1. map

*/

// Map

const numArray = [1, 2, 3, 4, 5];
const numSquareArray = numArray.map(item => Math.pow(item, 2));
const numCubeArray = numArray.map(item => Math.pow(item, 3));

console.log('numArray: ', numArray);
console.log('numSquareArray: ', numSquareArray);
console.log('numCubeArray: ', numCubeArray);

// sort: The method arr.sort sorts the array in place.

const sortArray = [5, 4, 8, 3, 2, 9, 1, 0];
console.log('unsorted: ', sortArray);
sortArray.sort();
console.log('sorted: ', sortArray);

// reverse: The method arr.reverse reverses the order of elements in arr.

const revArray = ['a', 'b', 'c', 'd'];
console.log('arr: ', revArray);
revArray.reverse();
console.log('revered arr: ', revArray);

// reduce: mThe methods arr.reduce and arr.reduceRight also belong to that breed,
// but are a little bit more intricate.
// They are used to calculate a single value based on the array.
console.log();
const reducedArray = sortArray.reduce((previousValue, item, index, array) => {
  console.log(`previousValue: ${previousValue}, item: ${item}, index: ${index}, array: ${array}`);

  return previousValue + item;
}, 0);
console.log('reducedArray: ', reducedArray);

// reduceRight: The method arr.reduceRight does the same, but goes from right to left.
console.log();
const reducedRightArray = sortArray.reduceRight((previousValue, item, index, array) => {
  console.log(`previousValue: ${previousValue}, item: ${item}, index: ${index}, array: ${array}`);

  return previousValue + item;
}, 0);
console.log('reducedRightArray: ', reducedRightArray);

/*
Array.isArray
Arrays do not form a separate language type. They are based on objects.

So typeof does not help to distinguish a plain object from an array:
*/

const someArray = [1, 2];
const someObject = {};

console.log();
console.log('typeof array:', typeof someArray); //object
console.log('typeof object:', typeof someObject); //object
console.log('isArray:', Array.isArray(someArray)); //true

// arr.fill(value, start, end) – fills the array with repeating value from index start to end.

const fillArray = Array(3).fill(null);
console.log('fillArray:', fillArray);

// arr.some(fn) checks the array.

// arr.every(fn)
