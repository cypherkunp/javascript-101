function Person(name) {
    this.name = name;
    this.sayName = function() {
        return this.name;
    };
}

const person = Person('Hello');
console.log(person); // undefined

function Human(name) {
    if (this instanceof Human) {
        this.name = name;
    } else {
        return new Human(name);
    }
}

const human1 = Human('Devvrat');
const human2 = new Human('Steve');

console.log(human1.name);
console.log(human2.name);

console.log(human1 instanceof Human); // true
console.log(human2 instanceof Human); // true
