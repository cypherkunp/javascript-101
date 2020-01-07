const animal = {
    eats: true
};

const rabbit = {
    runs: true
};

rabbit.__proto__ = animal;
// animal is the prototype of rabbit
// we can find both properties in rabbit now:
console.log(rabbit.runs);
console.log(rabbit.eats);

// this property is now defined on the rabbit object and will be referred from it hence forth
rabbit.eats = false;
console.log(rabbit.eats);
console.log('rabbit now has eats property', rabbit);

// but with getters/setters
