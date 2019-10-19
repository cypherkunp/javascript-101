const animal = {
    eats: true,
    toString() {
        return this.eats;
    }
};

function Cat(name) {
    this.name = name;
}

function Dog(name) {
    this.name = name;
}

Cat.prototype = animal;

const myCat = new Cat('Nike');
const myDog = new Dog('Fuzzy');

console.log(myCat.name, ' | ', myCat.eats);
console.log(animal.isPrototypeOf(myCat));
console.log(animal.isPrototypeOf(myDog));
console.log(animal.propertyIsEnumerable('eats'));
console.log(animal.propertyIsEnumerable('toString'));
