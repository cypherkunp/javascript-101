let map = new Map();

map.set('name', 'John');
map.set('age', 22);
map.set('married', false);

let keys = [...map.keys()];
let values = [...map.values()];

keys.push('more');

console.log(keys);
console.log(values);
