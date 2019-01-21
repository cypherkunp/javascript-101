// function expression: NOT HOISTED!
var catSays = function(max) {
  var catMessage = '';
  for (var i = 0; i < max; i++) {
    catMessage += 'meow ';
  }
  return catMessage;
};
console.log(catSays(10));

console.log('\n --------- \n');

// function declaration helloCat accepting a callback (HOISTED)
function helloCat(callbackFunc) {
  return 'Hello ' + callbackFunc(2);
}

// pass in catSays as a callback function
console.log(helloCat(catSays));

/*
Named function expressions
Inline function expressions
*/

// Function expression that assigns the function displayFavorite
// to the variable favoriteMovie
var favoriteMovie = function displayFavorite(movieName) {
  console.log('My favorite movie is ' + movieName);
};

// Function declaration that has two parameters: a function for displaying
// a message, along with a name of a movie
function movies(messageFunction, name) {
  messageFunction(name);
}

// Call the movies function, pass in the favoriteMovie function and name of movie
movies(favoriteMovie, 'Finding Nemo');

/*
Inline function expressions
A function expression is when a function is assigned to a variable. 
And, in JavaScript, this can also happen when you pass a function inline as an argument to another function.
 Take the favoriteMovie example for instance:
 
*/

// Call the movies function, pass in the function and name of movie
movies(function displayFavorite(movieName) {
  console.log('My favorite movie is ' + movieName);
}, 'Finding Nemo');

/*

Why use anonymous inline function expressions?
Using an anonymous inline function expression might seem like a very not-useful thing at first. 
Why define a function that can only be used once and you can't even call it by name?

Anonymous inline function expressions are often used with function callbacks that are probably not going 
to be reused elsewhere. Yes, you could store the function in a variable, give it a name, and pass it in like 
you saw in the examples above. However, when you know the function is not going to be reused, it could save
 you many lines of code to just define it inline.

*/

// The Function constructor
var multiplyTwoNumbers = new Function('a', 'b', 'return a * b');
console.log('a*b is > ' + multiplyTwoNumbers(2, 3));

// The argument object
function sumAll() {
  var i;
  var sum = 0;
  for (i = 0; i < arguments.length; i++) {
    sum += arguments[i];
  }
  return sum;
}
x = sumAll(1, 123, 500, 115, 44, 88);
console.log('Sum of all the numbers is > ', x);

// Functions arity
function reflect(value) {
  return value;
}
console.log(reflect('Hi!')); // "Hi!"
console.log(reflect('Hi!', 25)); // "Hi!"
console.log(reflect.length); // 1

reflect = function() {
  return arguments[0];
};
console.log(reflect('Hi!')); // "Hi!"
console.log(reflect('Hi!', 25)); // "Hi!"
console.log(reflect.length); // 0

// Function arguments example
function sum() {
  var result = 0,
    i = 0,
    len = arguments.length;
  while (i < len) {
    result += arguments[i];
    i++;
  }
  return result;
}
console.log('sum(1, 2) = ', sum(1, 2)); // 3
console.log('sum(3, 4, 5, 6) = ', sum(3, 4, 5, 6)); // 18
console.log('sum(50) = ', sum(50)); // 50
console.log('sum() = ', sum()); // 0

// Functions with the same name, last one is executed.
var sayMessage = new Function('message', 'console.log(message);');
sayMessage = new Function('console.log("Default message");');
sayMessage('Hello!'); // outputs "Default message"
