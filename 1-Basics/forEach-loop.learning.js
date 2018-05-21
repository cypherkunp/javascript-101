/*
The forEach loop is another type of for loop in JavaScript.
However, forEach() is actually an array method, so it can only
be used exclusively with arrays.
*/

// CODE BLOCK

var letters = ['a', 'b', 'c'];

letters.forEach(function (element) {
    console.log(element);
});

/*
Cons:
1. Can only be used with Arrays.
2. There is also no way to stop or break a forEach loop like basic for loop.
*/
