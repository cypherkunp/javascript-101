const numArray = [1, 2, 3, 4, 65, 7, 3, 8, 9, 20];
const strArray = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const mixArray = ['Monday', 1, true];

const crudArray = new Array();
// adding to an array
crudArray.push('Hello', 'Hi', 'Bye');
console.log(crudArray);
// update
let index = crudArray.indexOf('Hello');
crudArray[index] = 'Devvrat';
console.log(crudArray);
// delete the last element
crudArray.pop();
console.log(crudArray);

// since array is also an object you can also delete an array element like:
delete crudArray[0]; // this deletes only the value, length remains the same
console.log(crudArray);

// Adding and removing from the right : usage for stack DS
// use push to push to last and pop to remove the last: LIFO

// Adding and removing from the left of an array
// remove
crudArray.shift();
console.log('shift: ', crudArray);

// adding
crudArray.unshift('Added');
console.log('unshift: ', crudArray);
crudArray.unshift('Added Again');
console.log('unshift again: ', crudArray);

// string representation of an array
console.log('Array.toString(): ', crudArray.toString());
console.log('Array to string: ', crudArray + 'Added with a string');

/*
NOTE:
Arrays do not have Symbol.toPrimitive, neither a viable valueOf,
 they implement only toString conversion, so here [] becomes an empty string,
  [1] becomes "1" and [1,2] becomes "1,2".
*/
