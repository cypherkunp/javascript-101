let a = 1;

let c = a++; // return the value of  a and then increment in case of postfix
let b = ++a; // increment a and then return the value of a

console.log('c:', c); //1
console.log('b:', b); //3
console.log('a:', a); //3

let y = 2;
let x = 1 + (y *= 2);
console.log('y:', y); // 4
console.log('x:', x); //5
