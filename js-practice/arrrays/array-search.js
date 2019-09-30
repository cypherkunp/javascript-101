// indexOf/lastIndexOf and includes
/*
arr.indexOf(item, from) – looks for item starting from index from,
and returns the index where it was found, otherwise -1.

arr.lastIndexOf(item, from) – same, but looks for from right to left.

arr.includes(item, from) – looks for item starting from index from, returns true if found.
*/

let arr = [1, 0, false];

console.log(arr.indexOf(0)); // 1
console.log(arr.indexOf(false)); // 2
console.log(arr.indexOf(null)); // -1

console.log(arr.includes(1)); // true

// NaN only works with includes
arr = [NaN];
console.log(arr.indexOf(NaN)); // -1 (should be 0, but === equality doesn't work for NaN)
console.log(arr.includes(NaN)); // true (correct)

/*

find and findIndex
Imagine we have an array of objects. How do we find an object with the specific condition?
*/

let users = [
  { id: 1, name: 'John' },
  { id: 2, name: 'Pete' },
  { id: 3, name: 'Mary' },
  { id: 4, name: 'Idris' }
];

// true condition
const userIdris = users.find(item => item.name === 'Idris');
console.log(userIdris);

//false condition
const userMatt = users.find(item => item.name === 'Matt');
console.log(userMatt); // undefined

// true condition
const userIdrisIndex = users.findIndex(item => item.name === 'Idris');
console.log(userIdrisIndex);

//false condition
const userMattIndex = users.find(item => item.name === 'Matt');
console.log(userMattIndex);

// Finding multiple elements that match a given condition

const allUsers = users.filter(item => item.id < 3);
console.log(allUsers);
