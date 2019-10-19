const num = JSON.stringify(1);
console.log('num', num);

const str = JSON.stringify('hello');
console.log('str', str, str.length);

const bool = JSON.stringify(true);
console.log('bool', bool);

const nul = JSON.stringify(null);
console.log('nul', nul);

const undef = JSON.stringify(undefined);
console.log('undef', undef);

const arr = JSON.stringify([1, 2, 3]);
console.log('arr', arr);

const obj = JSON.stringify({ name: 'Devvrat' });
console.log('obj', obj);

/*

JSON is data-only cross-language specification, 
so some JavaScript-specific object properties are skipped by JSON.stringify.

Namely:

1. Function properties (methods).
2. Symbolic properties.
3. Properties that store undefined.

*/
