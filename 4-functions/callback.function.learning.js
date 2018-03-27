/*
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
