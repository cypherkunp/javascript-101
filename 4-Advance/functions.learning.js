/*
JavaScript hoists function declarations and variable declarations to the top of the current scope.
Variable assignments are not hoisted.
Declare functions and variables at the top of your scripts, so the syntax and behavior are consistent with each other.
*/



/* 
When a function is stored inside a variable it's called a function expression.
otherwise its called as a function declaration.
*/

var catSays = function (max) {
    var catMessage = "";
    for (var i = 0; i < max; i++) {
        catMessage += "meow ";
    }
    return catMessage;
};

/*
It's an anonymous function, a function with no name, and you've stored it in a variable called catSays.
And, if you try accessing the value of the variable catSays, you'll even see the function returned back to you.

All function declarations are hoisted and loaded before the script is actually run.

Function expressions are not hoisted, since they involve variable assignment,
and only variable declarations are hoisted. 
The function expression will not be loaded until the interpreter reaches it in the script.

*/

console.log(catSays(10));

/*

Functions as parameters
Being able to store a function in a variable makes it really simple to pass the function into another function. 
A function that is passed into another function is called a callback. Let's say you had a helloCat() function, 
and you wanted it to return "Hello" followed by a string of "meows" like you had with catSays. Well, rather than 
redoing all of your hard work, you can make helloCat() accept a callback function, and pass in catSays.

*/

console.log('\n --------- \n');


// function declaration helloCat accepting a callback
function helloCat(callbackFunc) {
    return "Hello " + callbackFunc(2);
}

// pass in catSays as a callback function
console.log(helloCat(catSays));


/*

Named function expressions
Inline function expressions
A function expression is when a function is assigned to a variable. And, in JavaScript,
 this can also happen when you pass a function inline as an argument to another function. 
 Take the favoriteMovie example for instance:
*/

// Function expression that assigns the function displayFavorite 
// to the variable favoriteMovie
var favoriteMovie = function displayFavorite(movieName) {
    console.log("My favorite movie is " + movieName);
};

// Function declaration that has two parameters: a function for displaying
// a message, along with a name of a movie
function movies(messageFunction, name) {
    messageFunction(name);
}

// Call the movies function, pass in the favoriteMovie function and name of movie
movies(favoriteMovie, "Finding Nemo");


/*
Inline function expressions
A function expression is when a function is assigned to a variable. 
And, in JavaScript, this can also happen when you pass a function inline as an argument to another function.
 Take the favoriteMovie example for instance:
 
*/


// Call the movies function, pass in the function and name of movie
movies(function displayFavorite(movieName) {
    console.log("My favorite movie is " + movieName);
}, "Finding Nemo");

/*

Why use anonymous inline function expressions?
Using an anonymous inline function expression might seem like a very not-useful thing at first. 
Why define a function that can only be used once and you can't even call it by name?

Anonymous inline function expressions are often used with function callbacks that are probably not going 
to be reused elsewhere. Yes, you could store the function in a variable, give it a name, and pass it in like 
you saw in the examples above. However, when you know the function is not going to be reused, it could save
 you many lines of code to just define it inline.

*/