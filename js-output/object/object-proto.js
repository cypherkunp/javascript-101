function Abc() {}

const a = new Abc();
const b = new Abc();
const c = new Abc();

c.__proto__.key = 'value';
Abc.prototype.name = 'devvrat';

// printing the values:
console.log(`a | key: ${a.key} | value: ${a.name}`);
console.log(`a | key: ${b.key} | value: ${b.name}`);
console.log(`a | key: ${c.key} | value: ${c.name}`);

console.log(`a | key: ${a.__proto__.key} | value: ${a.__proto__.name}`);
console.log(`a | key: ${b.__proto__.key} | value: ${b.__proto__.name}`);
console.log(`a | key: ${c.__proto__.key} | value: ${c.__proto__.name}`);
