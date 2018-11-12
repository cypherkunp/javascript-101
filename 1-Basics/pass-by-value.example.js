/**
 * Primitive parameters(such as a number) are passed to functions by value;
 * the value is passed to the function, but  if the function changes the value of the parameter,
 * this change is not reflected globally or in the calling function.
 */

//e.g

var number = 1;

function square(num) {
    num++;
    return num * num;
}

console.log(`Square of ${number + 1} is ${square(number)}`);
console.log(`Value of number is ${number}`);

