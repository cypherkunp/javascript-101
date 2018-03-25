
// SYMBOL

Symbol("foo") !== Symbol("foo")
const foo = Symbol()
const bar = Symbol()
let obj = {}
obj[foo] = "foo"
obj[bar] = "bar"
console.log(typeof foo === "symbol");
console.log(typeof bar === "symbol");
console.log(JSON.stringify(obj)) // {}
console.log(Object.keys(obj)); // []
console.log(Object.getOwnPropertyNames(obj)); // []
console.log(Object.getOwnPropertySymbols(obj)); // [ Symbol(), Symbol() ]