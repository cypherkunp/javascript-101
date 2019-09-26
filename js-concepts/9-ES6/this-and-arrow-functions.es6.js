"use strict";
/*
With regular functions, the value of this is set based on how the function is called.

With arrow functions, the value of this is based on the function's surrounding context.
In other words, the value of this inside an arrow function is the same as the value of this outside the function.

*/

console.log('\n$ Example 1: Results');
// constructor
function IceCream() {
    this.scoops = 0;
}

IceCream.prototype.getScoops = function () {
    return this.scoops;
}

// adds scoop to ice cream
IceCream.prototype.addScoop = function () {
    setTimeout(() => { // an arrow function is passed to setTimeout
        this.scoops++;
        console.log(`Scoop added! Total scoops are now ${this.scoops}`);
    }, 0.5);
};

const dessert = new IceCream();
dessert.addScoop();
console.log(dessert.scoops); // this will print 0

console.log('\n$ Example 2: Results');

const person = {
  talk() {
    setTimeout( _ => {
      console.log('This: ', this);
    }, 1000);
  },
  walk() {
    setTimeout( function(){
      console.log('Here this is referring to the global this > ', this);
    }, 1000);
  },
  nap() {
    var self = this;
    setTimeout(function () {
      console.log('This > ', self);
    }, 1000);
  }
}

console.log('calling person.talk();');
person.talk(); // returns this

console.log('calling person.walk();');
person.walk(); // returns global this

console.log('calling person.nap();');
person.nap(); // returns this