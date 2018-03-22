/*
Here’s the list of all of the falsy values:
the Boolean value false
the null type
the undefined type
the number 0
the empty string ""
the odd value NaN (stands for "not a number", check out the NaN MDN article)
That's right, there are only six falsy values in all of JavaScript!

ernary operator
The ternary operator provides you with a shortcut alternative for writing lengthy if...else statements.

conditional ? (if condition is true) : (if condition is false)

*/
var isGoing = true;
var color = isGoing ? "green" : "red";
console.log(color);