// normal expression

let sayHi = function() {
    console.log('Hi');
};

// named function expression
// This allows the function to refer itself internally
// it is not visible outside the function

let say = function greet(message) {
    if (message) {
        console.log(message);
    } else {
        greet('hello');
    }
};

sayHi();
say();
say('bye');

let welcome = say;
say = null;
welcome();

welcome = sayHi;
sayHi = null;
welcome();
