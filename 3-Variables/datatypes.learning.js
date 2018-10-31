// BOOLEAN
var booleanVar = true;
console.log('typeof booleanVar > ' + typeof booleanVar);

// NUMBER
var intNum = 12;
var floatNum = 3.86;
console.log('typeof intNum > ' + typeof intNum);
console.log('typeof floatNum > ' + typeof floatNum);

// NULL - bug in the language
var nullVar = null;
console.log('typeof nullVar > ' + typeof nullVar + ' - because it\'s a bug in the language.');

// UNDEFINED
var undefinedVar;
console.log('typeof undefinedVar > ' + typeof undefinedVar);

// STRING
var stringVar = "I am a string";
console.log('typeof stringVar > ' + typeof stringVar);

// SYMBOL - new primitive datatype in ES6
Symbol("foo") !== Symbol("foo")
const foo = Symbol()
const bar = Symbol()
let obj = {}
obj[foo] = "foo"
obj[bar] = "bar"
console.log("---------------------");
console.log('typeof foo > ' + typeof foo);
console.log(typeof bar === "symbol");
console.log(JSON.stringify(obj)) // {}
console.log(Object.keys(obj)); // []
console.log(Object.getOwnPropertyNames(obj)); // []
console.log(Object.getOwnPropertySymbols(obj)); // [ Symbol(), Symbol() ]
console.log("---------------------");

// OBJECT
var objVar = {
    a: "hello world",
    b: 42,
    c: true
};

console.log('typeof objVar > ' + typeof objVar);

console.log(objVar.a); // "hello world"
console.log(objVar.b); // 42
console.log(objVar.c); // true

console.log(objVar["a"]); // "hello world"
console.log(objVar["b"]); // 42
console.log(objVar["c"]); // true

// Built-In Type Methods

var stringVar = "Hello World";
var floatVar = 3.14159;

console.log('-----------------');
console.log(stringVar.length);
console.log(stringVar.toUpperCase());
console.log(floatVar.toFixed(4));
console.log('-----------------');


