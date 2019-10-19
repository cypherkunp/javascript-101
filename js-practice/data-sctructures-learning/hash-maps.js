/*
When you want to use javascript object as a hash map(purely for storing data), 
you might want to create it as follows.

When creating a map using object literal(const map = {}), the map inherits properties from Object by default.
 
It is equivalent to Object.create(Object.prototype).

But by doing Object.create(null), we explicitly specify null as its prototype.
 So it have absolutely no properties, not even constructor, toString, hasOwnProperty, etc.
  so you’re free to use those keys in your data structure if you need to.
*/

const dirtyMap = {};
const cleanMap = Object.create(null);

console.log(dirtyMap.constructor);
// function Object() { [native code] }

console.log(cleanMap.constructor); // undefined

// Iterating maps

console.log(dirtyMap);
console.log(cleanMap);

for (const key in dirtyMap) {
    if (dirtyMap.hasOwnProperty(key)) {
        // Check to avoid iterating over inherited properties.
        console.log(key + ' -> ' + dirtyMap[key]);
    }
}

for (const key in cleanMap) {
    console.log(key + ' -> ' + cleanMap[key]); // No need to add extra checks, as the object will always be clean
}
