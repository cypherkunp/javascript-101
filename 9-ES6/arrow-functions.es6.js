/*
ES6 introduces a new kind of function called the arrow function.
Arrow functions are very similar to regular functions in behavior,
but are quite different syntactically.
*/

// The following code takes a list of names and converts each one
// to uppercase using a regular function:

// before:
const upperizedNames = ['Farrin', 'Kagure', 'Asser'].map(function (name) {
    return name.toUpperCase();
});
console.log(upperizedNames);


// after: Using arrow function
const upperizedNamesViaArrow = ['Farrin', 'Kagure', 'Asser'].map(
    name => name.toUpperCase()
);
console.log(upperizedNamesViaArrow);

/*
Regular functions can be either function declarations or function expressions,
however arrow functions are always expressions.

In fact, their full name is "arrow function expressions",
so they can only be used where an expression is valid.

This includes being:
1. stored in a variable,
2. passed as an argument to a function,
3. stored in an object's property.
*/
console.log();

// 1. Arrow function when stored in a variable
// E.g. 1
const greet = name => `hello, ${name}`;
console.log(greet('devvrat'));
//E.g. 1.1
const greeting = (name) => `Hi, ${name}`;
console.log(greeting('devvrat'));

//E.g. 2
const sayHello = () => console.log('Hey there, hello!');
sayHello();

// E.g. 2.1
const sayHi = _ => console.log('Hey there, hi!');
sayHi();

//E.g. 3
const sayHelloToTheNewCustomer = (name, shopName) => `Hello ${name}, welcome to ${shopName} shop!`;
console.log(sayHelloToTheNewCustomer('devvrat', 'puma'));


// 2. Arrow function when passed as an argument to a function
const getCode = name => {
    name = name || "";
    let code = 0;
    for (let i = 0; i < name.length; i++) {
        code += name.charCodeAt(i);
    }
    console.log(code);
}
getCode('Dev');


// When you are returning a value then you must use curly braces:

const squares = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(square => { return square * square; });
console.log(...squares);

/*
NOTE:
1. return statements should be inside curly braces {}
2. other wise for single statements no need to use {}
*/

/*
Shortcomings:

1. there's a gotcha with the this keyword in arrow functions
2. arrow functions are only expressions. There's no such thing as an arrow function declaration
*/