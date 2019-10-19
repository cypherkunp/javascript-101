const devvrat = {
    name: 'Devvrat'
};

function User(name) {
    this.name = name;
}

class Person {
    constructor(name) {
        this.name = name;
    }
}

const user = new User('Mike');
const person = new Person('Jhon');

console.log(`${devvrat.constructor}`);
console.log(`${User.constructor}`);
console.log(`${Person.constructor}`);
console.log(`${user.constructor}`);
console.log(`${person.constructor}`);

console.log('------');
console.log(`${devvrat.constructor === 'Object'}`);
console.log(`${User.constructor === 'Object'}`);
console.log(`${Person.constructor === 'Object'}`);
console.log(`${user.constructor === 'Object'}`);
console.log(`${person.constructor === 'Object'}`);
