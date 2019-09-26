let type = 'quartz';
let color = 'rose';
let carat = 21.29;

// Object literal syntax
const gemstone = {
    type: type,
    color: color,
    carat: carat,
    calculateWorth: function () {
        return 'You are rich - ES5 syntax';
    },
    sayHello: function () {
        console.log('Hello ES5!');
    }
};

console.log(gemstone);
console.log(gemstone.calculateWorth);
console.log(gemstone.calculateWorth());
gemstone.sayHello();

// New way using Object Literal Shorthand
const gemstoneNew = {
    type,
    color,
    carat,
    calculateWorth(){
        return 'You are rich - ES6 syntax';
    },
    sayHello(){
        console.log('Hello ES6!');
    }
};
console.log(gemstoneNew);
console.log(gemstoneNew.calculateWorth);
console.log(gemstoneNew.calculateWorth());
gemstoneNew.sayHello();