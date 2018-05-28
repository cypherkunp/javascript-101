// New built-in object in ES6

/*
Maps
If Sets are similar to Arrays, then Maps are similar to Objects
because Maps store key-value pairs similar to how objects contain named properties with values.

Essentially, a Map is an object that lets you store key-value pairs
 where both the keys and the values can be objects, primitive values, or a combination of the two.
*/

// How to Create a Map
const employees = new Map();
console.log(employees);

// Adding to a map

employees.set('james.parkes@udacity.com', {
    firstName: 'James',
    lastName: 'Parkes',
    role: 'Content Developer'
});
employees.set('devvratshukla@gmail.com',{
    firstName: 'Devvrat',
    lastName: 'Shukla',
    role: 'Framework developer'
});
console.log(employees);

// Reading from a map
console.log('\n//Reading key=devvratshukla@gmail.com value from the map');
console.log(employees.get('devvratshukla@gmail.com'));

// Deleting from a map
employees.delete('devvratshukla@gmail.com');
console.log('\n//Deleting key from a map', employees);

// Checking if a key exists in the map or not
console.log('\n//Checking if a key exists in the map or not');
console.log('key=james.parkes@udacity.com', employees.has('james.parkes@udacity.com'));
console.log('key=devvratshukla@gmail.com', employees.has('devvratshukla@gmail.com'));

// Adding more key values pairs to the employee set
employees.set('devvratshukla@gmail.com', {
    firstName: 'Devvrat',
    lastName: 'Shukla',
    role: 'Framework developer'
});
employees.set('mikechap@gmail.com', {
    firstName: 'Mike',
    lastName: 'Chapman',
    role: 'Full stack developer'
});
employees.set('ianbum@gmail.com', {
    firstName: 'Ian',
    lastName: 'Bum',
    role: 'DevOps Engineer'
});
// Looping Through Maps

//1. Step through each key or value using the Map’s default iterator and while loop
console.log('\n//Looping through maps - Using the Map’s default iterator and while loop');

const empIterator = employees.keys();
let empKey = empIterator.next();
while (empKey.done === false) {
    console.log(empKey);
    empKey = empIterator.next();
}

//2. Step through each key or value using for..of
console.log('\n//2. Step through each key or value using for..of');
for (const employee of employees) {
    console.log(employee);
}
/*
NOTE:
However, when you use a for...of loop with a Map, you don’t exactly get back a key or a value.
Instead, the key-value pair is split up into an array where the first element is the key and
the second element is the value.
*/

// 3. Using a forEach Loop
console.log('\n // 3. Using a forEach Loop');

employees.forEach((value, key) => console.log(key, value));