# JavaScript 101

## How to run the JS files in this project?
1. Install [nodejs](https://nodejs.org/)
2. Launch the terminal and run > `$ node <file-name.js>`


## Recommended reading by Addy Osmai
1. JavaScript: The Definitive Guide by David Flanagan
2. Eloquent JavaScript by Marijn Haverbeke
3. JavaScript Patterns by Stoyan Stefanov
4. Writing Maintainable JavaScript by Nicholas Zakas
5. JavaScript: The Good Parts by Douglas Crockford
6. [Learning JavaScript Design Patterns](https://addyosmani.com/resources/essentialjsdesignpatterns/book/index.html) - by Addy Osmani

---

## References

### Books
1. [You Don't Know JS: Up & Going | by Kyle Simpson](https://www.gitbook.com/book/patrickfatrick/you-don-t-know-js-up-going/details)
    - [Github link](https://github.com/getify/You-Dont-Know-JS)
2. [Principles of Object-Oriented JavaScript | by Nicholas C. Zakas](https://nostarch.com/oojs)

### YouTube
1. [Let's Learn ES6 - Classes | by Ryan Christian](https://www.youtube.com/watch?v=EUtZRwA7Fqc)

### Blogs
1. [ECMAScript 6 — New Features: Overview & Comparison](http://es6-features.org)

### Online Courses
1. [MDN web docs by Mozilla](https://developer.mozilla.org/en-US/docs/Web/JavaScript)

---

## JavaScript Concepts

### Introduction to JS
__JavaScript®__ (often shortened to __JS__) is a lightweight, interpreted, object-oriented language with _first-class_ functions, and is best known as the scripting language for Web pages, but it's used in many non-browser environments as well. It is a _prototype-based_, multi-paradigm scripting language that is dynamic, and supports _object-oriented_, _imperative_, and _functional programming_ styles.

### First-class Function
A programming language is said to have _First-class_ functions when functions in that language are treated like any other variable. For example, in such a language, a function can be passed as an argument to other functions, can be returned by another function and can be assigned as a value to a variable.

### Data types

The latest ECMAScript standard defines seven data types:

1. Boolean
2. Null
3. Undefined
4. Number
5. String
6. Symbol (new in ECMAScript 6)
* and Object


* null > _null_ refers to the "value of nothing".
* undefined > _undefined_ refers to the "absence of value".
* falsy values > false, 0, "", null, undefined, and NaN

### Arrays

The difference Between Arrays and Objects:

* In JavaScript, arrays use numbered indexes.  
* In JavaScript, objects use named indexes.

When to use Arrays and when to use Objects:

* JavaScript does not support associative arrays.
* Use objects when you want the element names to be strings (text).
* You should use arrays when you want the element names to be numbers.

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


### The JavaScript call() Method
- The call() method is a predefined JavaScript function method.
- It can be used to invoke (call) a function with an owner object as the first argument (parameter).
- With call(), you can use a method belonging to another object.
- This example calls the fullName function of person, but is using it on myObject:
```
var person = {
    firstName:"John",
    lastName: "Doe",
    fullName: function() {
        return this.firstName + " " + this.lastName;
    }
}
var myObject = {
    firstName:"Mary",
    lastName: "Doe",
}
person.fullName.call(myObject);  // Will return "Mary Doe"
```
---

## OOP is JS

### The four pillars of Object Oriented Programming are:

1. Encapsulation
2. Abstraction
3. Inheritance
4. Polymorphism

### Encapsulation

* An object has Properties and Methods, e.g. A car has:
  * Properties: make, model, color
  * Methods: start(), stop(), break()