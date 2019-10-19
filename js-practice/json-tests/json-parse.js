const num = JSON.parse(1);
console.log('num', num);

const str = JSON.parse('hello');
console.log('str', str, str.length);

const bool = JSON.parse(true);
console.log('bool', bool);

const nul = JSON.parse(null);
console.log('nul', nul);

const undef = JSON.parse(undefined);
console.log('undef', undef);

const arr = JSON.parse([1, 2, 3]);
console.log('arr', arr);

const obj = JSON.parse({ name: 'Devvrat' });
console.log('obj', obj);
