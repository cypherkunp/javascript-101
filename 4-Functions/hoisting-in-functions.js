sayHello();
// sayBye(); // ReferenceError: sayBye is not defined

// Function declaration
// function declaration are hosted, so it can be called before it is declared in a js file
function sayHello() {
    console.log('Hello There!');
}

// function expression
// function expressions are not hoisted, so they can only be called after they are declared.
const sayBye = function () {
    console.log('Bye Bye!');
};

sayBye();