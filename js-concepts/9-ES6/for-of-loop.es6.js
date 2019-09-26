/*
The for...of loop is the most recent addition to the family of for loops in JavaScript.

It combines the strengths of its siblings, the for loop and the for...in loop,
to loop over any type of data that is iterable (meaning it follows the iterable
protocol which we'll look at in lesson

By default, this includes the data types String, Array, Map, and Set.
Notably absent from this list is the Object data type (i.e. {}).
Objects are not iterable, by default.
*/

// for..of with NUMBERS ARRAY
const digits = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

for (const digit of digits) {
  console.log(digit);
}

/*
TIP:
It’s good practice to use plural names for objects that are collections of values.
That way, when you loop over the collection, you can use the singular version of the
name when referencing individual values in the collection.
For example, for (const button of buttons) {...}.
*/

console.log("Printing Even numbers: ");

for (const digit of digits) {
  if (digit % 2 !== 0) {
    continue;
  }
  console.log(digit);
}

Array.prototype.decimalfy = function() {
  for (i = 0; i < this.length; i++) {
    this[i] = this[i].toFixed(2);
  }
};
console.log("After adding another property to the prototype of Array");

for (const digit of digits) {
  console.log(digit);
}

// for..of with STRING ARRAY

const days = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday"
];

for (const day of days) {
  console.log(day.charAt(0).toUpperCase() + day.slice(1));
}
