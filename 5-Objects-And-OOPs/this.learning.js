"use strict";

class Circle {
  draw() {
    console.log(this);
  }
}

var c = new Circle();
// method call
c.draw(); // Circle {}

const draw = c.draw;
// function call
draw(); // undefined

// ----------------------

var fn = function(one, two) {
  console.log(one, two);
};

var fnThis = function(one, two) {
  console.log(this, one, two);
};

fn("Hello", "Hi");
fn({ greet: "Hi" }, {});
fn([1, 2, 3], ["Hello", "hi"]);

var ofn = {};
ofn.method = fnThis;

// this gets a context only when a dot operation is called on an object;
ofn.method("Hello", "Hi");

// using call method

fnThis.call(ofn, 1, 2);
ofn.method.call(ofn, "call", "ofn.method.call");

console.log("\nExample 2:\n");
// Example 2:
const person = {
  name: "Mike",
  walk() {
    console.log(this);
  }
};

person.walk();
console.log("\nAssigning the reference to the walk function >");
const walk1 = person.walk; // assigning the reference to the walk function
walk1(); // this will be undefined here.

console.log("\nBinding this using .bind() >");
const walk2 = person.walk.bind(person);
walk2();
