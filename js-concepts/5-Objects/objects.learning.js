/**
 * Objects in code
 */

var umbrella = {
    color: "pink",
    isOpen: false,
    open: function () {
        if (umbrella.isOpen === true) {
            return "The umbrella is already opened!";
        } else {
            umbrella.isOpen = true;
            return "Julia opens the umbrella!";
        }
    },
    close: function () {
        if(umbrella.isOpen === true){
            umbrella.isOpen = false;
            return "The umbrella is now closed!";
        } else {
            return "The umbrella is already closed!";
        }
    }
}; 

/** 
 Two equivalent ways to use the key to return its value
sister["parents"] // returns [ "alice", "andy" ]
sister.parents // also returns ["alice", "andy"]
Using sister["parents"] is called bracket notation (because of the brackets!) and 
using sister.parents is called dot notation (because of the dot!).
*/


/*
typeof: typeof is an operator that returns the name of the data type that follows it:
*/

console.log(typeof "hello"); // returns "string"
console.log(typeof true); // returns "boolean"
console.log(typeof [1, 2, 3]); // returns "object" (Arrays are a type of object)
console.log(typeof function hello() { }); // returns "function"