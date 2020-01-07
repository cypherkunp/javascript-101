const map = new Map();
map.set('name', 'John');

const keys = [...map.keys()];
keys.push('more');

console.log('keys: ', keys);
