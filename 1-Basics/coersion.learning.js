//Here’ s an example of explicit coercion:

var a = "42";
var b = Number(a);

console.log('__Explicit__')
console.log(`a: ${typeof a} `); // "42"
console.log(`b: ${typeof b}`); // 42--the number!
console.log();

//And here’ s an example of implicit coercion:

var a = "42";
var b = a * 1; // "42" implicitly coerced to 42 here

console.log('__Implicit__')
console.log(`a: ${typeof a} `); // "42"
console.log(`b: ${typeof b}`); // 42--the number!