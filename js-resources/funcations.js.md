## JavaScript Function Definition

JavaScript function are defined with the _function_ keyword. 
Functions can be defined as:
1. Function declaration:
    * Declared functions are not executed immediately but are executed upton invocation.
2. Function expressions:
    * When a function is stored inside a variable it's called a function expression.
    * A function expression can be stored in a variable and the variable can then be used as a function:
    * It's an anonymous function, a function with no name, and you've stored it in a variable say catFun. And, if you try accessing the value of the variable catFun, you'll even see the function returned back to you.

### Function declaration example:
```
function functionName(parameters) {
  code to be executed
}
```
### Function expression example:
```
var x = function (a, b) {return a * b};
```
### Function hoisting
- JavaScript hoists function declarations and variable declarations to the top of the current scope.
- So, declare functions and variables at the top of your scripts, so the syntax and behavior are consistent with each other.
- All function declarations are hoisted and loaded before the script is actually run.
- Function expressions are not hoisted, since they involve variable assignment and only variable declarations are hoisted. 
- The function expression will not be loaded until the interpreter reaches it in the script.

### Functions as parameters
- Being able to store a function in a variable makes it really simple to pass the function into another function. 
- A function that is passed into another function is called a callback. 

### The Function() constructor
- Functions can also be defined with a built-in JavaScript function constructor called Function().
- E.g.
``` 
var myFunction = new Function("a", "b", "return a * b");
```
### Immediately invoked functions
```
(function(){ //TODO })();
```

### Functions as objects
- The `typeof` operator in JavaScript returns "function" for functions.
- JavaScript functions have both __properties__ and __methods__.
- A function defined as the property of an object, is called a method to the object.
- A function designed to create new objects, is called an object constructor.

## Function Parameters and Arguments
```
functionName(parameter1, parameter2, parameter3) {
    code to be executed
}
```
- Function parameters are the names listed in the function definition.
- Function arguments are the real values passed to (and received by) the function.

### Parameter Rules
- JavaScript function definitions do not specify data types for parameters.
- JavaScript functions do not perform type checking on the passed arguments.
- JavaScript functions do not check the number of arguments received.

### Parameter Defaults
- If a function is called with missing arguments (less than declared), the missing values are set to: undefined

### The Arguments Object
- JavaScript functions have a built-in object called the arguments object.
- The argument object contains an array of the arguments used when the function was called (invoked).

### Arguments are Passed by Value
- The parameters, in a function call, are the function's arguments.
- JavaScript arguments are passed by value: The function only gets to know the values, not the argument's locations.
- If a function changes an argument's value, it does not change the parameter's original value.
- Changes to arguments are not visible (reflected) outside the function.

### Objects are Passed by Reference
- In JavaScript, object references are values.
- Because of this, objects will behave like they are passed by reference:
    - If a function changes an object property, it changes the original value.
- __Changes to object properties are visible (reflected) outside the function.__