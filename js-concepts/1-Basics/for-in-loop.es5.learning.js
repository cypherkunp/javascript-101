/*
The for...in loop improves upon the weaknesses of the for loop by eliminating the counting logic and exit condition.
*/
const digits = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

for (const index in digits) {
  console.log(digits[index]);
}

/*
Cons:
1. You still have to deal with the issue of using an index to access the values of the array
2. You into big trouble when you need to add an extra method to an array (or another object).
Because for...in loops loop over all enumerable properties, this means if you add any additional
properties to the array's prototype, then those properties will also appear in the loop.
E.g.
*/

Array.prototype.decimalfy = function () {
    for (let i = 0; i < this.length; i++) {
        this[i] = this[i].toFixed(2);
    }
};

for (const index in digits) {
    console.log(digits[index]);
}