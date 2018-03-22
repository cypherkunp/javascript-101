/*
 A reference to executable code, or a piece of executable code, that is passed as an argument to other code.
 Notice that the actual parameter is just “callback” (without parentheses), but then when the callback is executed,
  it’s done using parentheses. You can call this parameter whatever you want,
   I just used “callback” so it’s obvious what’s going on.

The callback function itself is defined in the third argument passed to the function call.
 That code has another alert message to tell you that the callback code has now executed. 
 You can see in this simple example that an argument passed into a function can be a function itself, 
 and this is what makes callbacks possible in JavaScript.
*/

function mySandwich(param1, param2, callback) {
    console.log('Started eating my sandwich.\n');

    if (param1) {
        console.log(`It has: ${param1}\n`);
    }

    if (param2) {
        console.log(`It has: ${param2}\n`);
    }
    
    if (callback && typeof (callback) === "function") {
        callback();
    }
}

mySandwich('ham', 'cheese', function () {
    console.log('Finished eating my sandwich.');
});
