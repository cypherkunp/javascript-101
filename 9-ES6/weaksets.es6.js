/*
What is a WeakSet?
A WeakSet is just like a normal Set with a few key differences:

1. a WeakSet can only contain objects
2. a WeakSet is not iterable which means it can’t be looped over
3. a WeakSet does not have a .clear() method
*/

let student1 = { name: 'James', age: 26, gender: 'male' };
let student2 = { name: 'Julia', age: 27, gender: 'female' };
let student3 = { name: 'Richard', age: 31, gender: 'male' };

const roster = new WeakSet([student1, student2, student3]);
console.log(roster);

// This will throw error as only objects are allowed in a weak set
// roster.add('Amanda');

/*
WeakSets take advantage of this by exclusively working with objects.
If you set an object to null, then you’re essentially deleting the object.
And when JavaScript’s garbage collector runs, the memory that object
previously occupied will be freed up to be used later in your program.
*/

student3 = null;
console.log(roster);