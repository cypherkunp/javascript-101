/**
 * Set is a collection of unique objects.
 *
 * Sets are now natively supported by JS ES6 implementation 
 *
 * Operations supported by a set are:
 * 1. Add
 * 2. Delete
 * 3. Clear
 * 4. Values
 * 5. Has
 * 6. forEach
 */

 var mySet = new Set();
 mySet.add('Mike');
 mySet.add('Steve');
 mySet.add('Wozniak');
 mySet.add('Tim');

console.log(mySet);
 
// Add a duplicate value
mySet.add('Steve');

console.log('\n--- After adding a duplicate ---');
console.log(mySet);

// printing all the values
console.log('\n--- Printing all the values in the set ---');

mySet.forEach((value) => {
    console.log(value);
})

// Checking for an entry in the set
console.log('\n--- Checking for an entry in the set ---');

console.log(`Checking for Steve > ${mySet.has('Steve')}`);
console.log(`Checking for Bill > ${mySet.has('bill')}`);

// deleting from the set
mySet.delete('Steve');

console.log('\n--- After deleting Steve ---');
for (const name of mySet) {
    console.log(name);
}

// Clearing the set
console.log('\n--- Clearing the set ---');
mySet.clear();
console.log(mySet);