/*
A Set is a special type collection – “set of values” (without keys), 
where each value may occur only once.

Its main methods are:

new Set(iterable) – creates the set, and if an iterable object is provided 
(usually an array), copies values from it into the set.
set.add(value) – adds a value, returns the set itself.
set.delete(value) – removes the value, returns true if value existed at the moment of t
he call, otherwise false.
set.has(value) – returns true if the value exists in the set, otherwise false.
set.clear() – removes everything from the set.
set.size – is the elements count.
*/

/*
The same methods Map has for iterators are also supported:

set.keys() – returns an iterable object for values,
set.values() – same as set.keys(), for compatibility with Map,
set.entries() – returns an iterable object for entries [value, value], 
exists for compatibility with Map.

Also, set has a forEach to iterate over a set
*/

const mySet = new Set();

mySet
    .set('greet', 'hello')
    .set(false, false)
    .set(0, 0)
    .set(id, 'Symbol: id')
    .set({ name: 'Devvrat' }, { name: 'Devvrat' })
    .set(null, null)
    .set(NaN, NaN)
    .set(undefined, undefined);
