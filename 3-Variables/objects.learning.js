const count = {
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5
};

/* Object.keys: creates an array that contains the properties of an object.
 */
console.log('Object Keys: ', Object.keys(count));

/* Object.values: creates an array that contains the values of every property in an object.
 */
console.log('Object Values: ', Object.values(count));

/* Object.entries: creates an array of arrays.
 Each inner array has two item. The first item is the property; the second item is the value.
 */
console.log('Object Entries: ', Object.entries(count));

// Looping through the array

for (const [key, value] of Object.entries(count)) {
  console.log(`${key}:${value}`);
}
