/*
The arr.splice(str) method is a swiss army knife for arrays. 
It can do everything: insert, remove and replace elements.

The syntax is:
arr.splice(index[, deleteCount, elem1, ..., elemN])
*/

const arr = [1, 2, 3, 4, 5];
console.log('init: ', arr);

// removing an item
arr.splice(0, 1);
console.log('1: ', arr);

// remove and replace
const removedElements = arr.splice(0, 2, 'a', 'b', 'c');
console.log('2: ', arr);
console.log('removedElements: ', removedElements);

// Negative indexes allowed
arr.splice(-2, 0, 1, 2, 3);
console.log('Adding 1,2,3 before 4 and 5: ', arr);
