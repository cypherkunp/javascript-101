const numArray = [1, 4, 6, 3, 8, 9];
// using Math.max and spread operator
console.log('Max from the array is> ', Math.max(...numArray));

// using Math.max
console.log('Max from the array is> ', Math.max.apply(null, numArray));

// using for of
let max = 0;
for (const element of numArray) {
  max = element > max ? element : max;
}
console.log('Max from the array is> ', max);
