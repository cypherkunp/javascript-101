let user = {
    firstName: 'John',
    sayHi() {
        console.log(`Hello, ${this.firstName}!`);
    }
};

/*
When passing object methods as callbacks, for instance to setTimeout, there’s a known problem: "losing this".
*/
setTimeout(user.sayHi, 1000);

// solution 1: Wrapper
/*
Now it works, because it receives user from the outer lexical environment, and then calls the method normally.
*/

setTimeout(() => {
    user.sayHi();
}, 2000);

// solution 1 problem, if the objects gets updated by the time setTimeout triggers,
// then the it will end up calling the wrong function

//solution 2: bind
const sayHi = user.sayHi.bind(user);
setTimeout(sayHi, 5000);
user.firstName = 'Jhon Updated';
