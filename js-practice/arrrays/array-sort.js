const strArray = ['abc', 'Hello', 'Bye', 'See You', 'Namastey', 'Cherio'];
const numArray = [3.5, 8, 9, 3, 4, 7, 10, 15, 13];

console.log('Original Array: ', strArray);
strArray.sort((a, b) => a.toLowerCase() > b.toLowerCase());
console.log('Incremental Sort String Array: ', strArray);
strArray.sort((a, b) => a.toLowerCase() < b.toLowerCase());

console.log('Decremental Sort String Array: ', strArray);
console.log();
console.log('Original Array: ', numArray);
const inSortNumArray = numArray.sort((a, b) => a - b);
console.log('Incremental Sort number Array: ', numArray);
console.log('Incremental Sort number Array: ', inSortNumArray);
