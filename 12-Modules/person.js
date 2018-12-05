// named export
function processDetails(param) {
    console.log(param);
}

// default export
class Person {
    constructor(name, age) {
        this.name = name;
        this.age = age;
    }

    walk() {
        console.log(`${this.name} is walking...`);
    }
}

module.exports = Person;
