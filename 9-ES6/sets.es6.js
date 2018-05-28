// New built -in object in ES6

/*
Sets
In ES6, there’s a new built -in object that behaves like a mathematical set
and works similarly to an array.

This new object is conveniently called a "Set".

The biggest differences between a set and an array are:
1. Sets are not indexed - based - you do not refer to items in a set based on their position in the set
2. items in a Set can’t be accessed individually

Basically, a Set is an object that lets you store unique items.
You can add items to a Set, remove items from a Set, and loop over a Set.
These items can be either primitive values or objects.
*/

// creating a SET

const games = new Set(['Super Mario Bros.', 'Banjo-Kazooie', 'Mario Kart', 'Super Mario Bros.']);
console.log(games);

// operations on a SET

// ADD
games.add('Contra');
console.log(`After adding 'contra' > `, games);

// DELETE
games.delete('Mario Kart');
console.log(`After deleting 'Mario Kart' > `, games);

// Checking The Length

const months = new Set(['January', 'February', 'March', 'April', 'May', 'June', 'August', 'September', 'October', 'November', 'December']);
console.log(`Size of months set is > `, months.size);

// Checking If An Item Exists
console.log('Does the months have January > ', months.has('January'));
console.log('Does the months have Jan > ', months.has('Jan'));

// Retrieving All Values
console.log('All the values of the set > ', months.values());

// Using the setIterator in a while loop
console.log('// Using the setIterator in a while loop');
let setIterator = months.values();
let setElement = setIterator.next();
while (setElement.done == false) {
    console.log(setElement);
    setElement = setIterator.next();
}

// Using for--of loop
console.log('// Using for--of loop');
for (const month of months) {
    console.log(month);
}


// Clearing a SET
months.clear();
console.log(`// Clearing the months SET `);
console.log(months);

// The forEach()
// method executes a provided function once for each value in the Set object, in insertion order.
console.log('// The forEach()');
function printSquare(value) {
    console.log(`${value*value}`);
}

new Set([1, 2, 3, 4]).forEach(printSquare);