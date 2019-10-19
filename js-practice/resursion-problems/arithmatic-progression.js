// using loop
function apLoop(n) {
  let sum = 0;
  for (let index = 1; index <= n; index++) {
    sum += index;
  }
  return sum;
}

// recursion
function ap(n) {
  return n === 1 ? 1 : n + ap(n - 1);
}

// arithmetic progression formula
function apFormula(n) {
  return (n * (1 + n)) / 2;
}

console.time('AP: Loop');
console.log(apLoop(10));
console.timeEnd('AP: Loop');

console.time('AP: Loop');
console.log(ap(10));
console.timeEnd('AP: Loop');

console.time('AP: Loop');
console.log(apFormula(10));
console.timeEnd('AP: Loop');
