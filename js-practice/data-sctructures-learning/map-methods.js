/*

Map is a collection of keyed data items, just like an Object.
But the main difference is that Map allows keys of any type.

Methods and properties are:

new Map() – creates the map.
map.set(key, value) – stores the value by the key.
map.get(key) – returns the value by the key, undefined if key doesn’t exist in map.
map.has(key) – returns true if the key exists, false otherwise.
map.delete(key) – removes the value by the key.
map.clear() – removes everything from the map.
map.size – returns the current element count.
*/

/*
To test keys for equivalence, Map uses the algorithm SameValueZero.
It is roughly the same as strict equality ===, 
but the difference is that NaN is considered equal to NaN.
So NaN can be used as the key as well.

This algorithm can’t be changed or customized.
*/

const myMap = new Map();
const id = Symbol('id');

// map.set can be chained as well
myMap
    .set('greet', 'hello')
    .set(false, false)
    .set(0, 0)
    .set(id, 'Symbol: id')
    .set({ name: 'Devvrat' }, { name: 'Devvrat' })
    .set(null, null)
    .set(NaN, NaN)
    .set(undefined, undefined);

/*
Iteration over Map:
For looping over a map, there are 3 methods:

map.keys() – returns an iterable for keys,
map.values() – returns an iterable for values,
map.entries() – returns an iterable for entries [key, value], it’s used by default in for..of.

The iteration goes in the same order as the values were inserted.
Map preserves this order, unlike a regular Object.

ALso, Besides that, Map has a built-in forEach method, similar to Array:

*/

// map.keys
console.log('map.keys => Size: ', myMap.size);
for (const key of myMap.keys()) {
    console.log(key, ': ', myMap.get(key));
}

// map.entries
console.log('\nmap.entries => Size: ', myMap.size);
for (const [key, value] of myMap.entries()) {
    console.log(key, ': ', value);
}

//map.forEach
console.log('\nmap.forEach => Size: ', myMap.size);
myMap.forEach((key, value) => {
    console.log(key, ': ', value);
});

// map.has
console.log('\nMap Has =>');
console.log('NaN', myMap.has(NaN));
console.log('null', myMap.has(null));
console.log('undefined', myMap.has(undefined));
console.log('id', myMap.has(id));
console.log('greet', myMap.has('greet'));
console.log('{name: Devvrat}', myMap.has({ name: 'Devvrat' }));
