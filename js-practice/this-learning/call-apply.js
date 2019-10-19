/*
call():
- The call() method calls a function with a given 'this' value and arguments provided individually.
- Expects all parameters to be passed in individually, comma separated

apply()
- The apply() method calls a function with a given 'this' value and arguments provided individually.
- Expects an array of all of our parameters.

The main differences between bind() and call() is that the call() method:
- Accepts additional parameters as well
- Executes the function it was called upon right away.
- The call() method does not make a copy of the function it is being called on.
*/

const user = {
    name: 'Devvrat'
};

function greetUser(greetMessage) {
    return `${greetMessage}, ${this.name}`;
}

console.log('Call  => ', greetUser.call(user, 'Hello'));
console.log('Apply => ', greetUser.apply(user, ['Hello']));
