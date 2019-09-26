// Doesn't mutate the array

const arr = [1, 2, 3, 4, 5];
const strArr = ['hello', 'hi'];

arr.concat([6, 7, 8]);
console.log(arr); // [1,2,3,4,5]

const newArr = arr.concat(6, 7, 8);
console.log(newArr);

const mixArr = arr.concat(strArr);
console.log(mixArr);

let arrayLike = {
  0: 'something',
  1: 'else',
  [Symbol.isConcatSpreadable]: true,
  length: 2
};

console.log(arr.concat(arrayLike)); // 1,2,something,else
