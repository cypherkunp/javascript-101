function sum(a, b) {
  return a + b;
}

// Anything added to a string becomes a string
console.log(sum(1, '2')); //12
console.log(sum('1', 2)); //12
console.log(sum(undefined, '2')); //undefined2
console.log(sum(null, '2')); //null2
console.log(sum(NaN, '2')); //NaN2

console.log(sum(undefined, 2)); //NaN
console.log(sum(null, 2)); //2
console.log(sum(NaN, 2)); //NaN
