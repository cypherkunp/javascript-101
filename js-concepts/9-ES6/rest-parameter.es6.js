/*
If you can use the spread operator to spread an array into multiple elements,
then certainly there should be a way to bundle multiple elements back into an array, right ?

In fact, there is! It’s called the rest parameter, and it’s another new addition in ES6.

Rest parameter:
The rest parameter, also written with three consecutive dots(... ),
allows you to represent an indefinite number of elements as an array.

This can be helpful in a couple of different situations.

One situation is when assigning the values of an array to variables.For example:
*/

const order = [20.17, 18.67, 1.50, "cheese", "eggs", "milk", "bread"];
const [total, subtotal, tax, ...items] = order;
console.log(total, subtotal, tax, items);

/*
Also check out its implementation in variadic functions.
File is located under 4-Function\variadic.functions.js
*/