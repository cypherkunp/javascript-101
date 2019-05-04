// methods for looping over arrays in Javascript.

const intArray = [1, 2, 3, 4, 5, 6, 7, 8];

// .forEach: for just looping over array and it doesn't return an array
intArray.forEach((currentValue, index, array) => {
  console.log(`At index ${index} in array ${array} the value is ${currentValue}`);
});

// .map: returns a new array
const squaredArray = intArray.map(x => Math.pow(x, 2));
console.log('\nOrignal Array: ', intArray);
console.log('Squared Array: ', squaredArray);

// .reduce: returns a single value
/* The reduce() method applies a function against an accumulator and each element in the array
 (from left to right) to reduce it to a single value.
 */

const sum = intArray.reduce((x, y) => x + y, 0);
console.log('\nSum of all integers in intArray: ', sum);

// .filter: returns a new array
/* Filters elements on an array based on a boolean function.
 */

const evenNum = intArray.filter(x => x % 2 === 0);
console.log('\nEven numbers in intArray: ', evenNum);

// .every: return boolean value
/*
test if a given condition is met in every element
*/

let hasOnlyEvenNumbers = intArray.every(x => x % 2 === 0);
console.log('\nintArray has only even integers: ', hasOnlyEvenNumbers);
hasOnlyEvenNumbers = evenNum.every(x => x % 2 === 0);
console.log('evenNum has only even integers: ', hasOnlyEvenNumbers);

// .some() returns boolean
const hasEvenNumbers = intArray.some(x => x % 2 === 0);
console.log(`\nintArray has even numbers in it: `, hasEvenNumbers);
