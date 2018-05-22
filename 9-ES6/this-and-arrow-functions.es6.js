/*
With regular functions, the value of this is set based on how the function is called.

With arrow functions, the value of this is based on the function's surrounding context.
In other words, the value of this inside an arrow function is the same as the value of this outside the function.

*/

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
        cone.scoops++;
        console.log('scoop added!');
    }, 0.5);
};

const dessert = new IceCream();
dessert.addScoop();
console.log(dessert.scoops);
