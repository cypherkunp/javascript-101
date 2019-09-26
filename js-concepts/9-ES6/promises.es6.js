/*
A promise will let you start some work that will be done asynchronously
and let you get back to your regular work. When you create the promise,
you must give it the code that will be run asynchronously.

You provide this code as the argument of the constructor function:
*/

var mySundae = new Promise(function (resolve, reject) {
    window.setTimeout(function createSundae(flavor = 'chocolate') {
        const sundae = {};
        // request ice cream
        // get cone
        // warm up ice cream scoop
        // scoop generous portion into cone!
        if ( /* iceCreamConeIsEmpty(flavor) */ ) {
            reject(`Sorry, we're out of that flavor :-(`);
        }
        resolve(sundae);
    }, Math.random() * 2000);
});

/*
That object has a .then() method on it that we can use to have
it notify us if the request we made in the promise was either successful or failed.

The .then() method takes two functions:
1. the function to run if the request completed successfully
2. the function to run if the request failed to complete
*/
mySundae.then(function (sundae) {
    console.log(`Time to eat my delicious ${sundae}`);
}, function (msg) {
    console.log(msg);
    self.goCry(); // not a real method
});