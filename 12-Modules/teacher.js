const Person = require("./person");

class Teacher extends Person {
    constructor(name, age, degree) {
        super(name, age);
        this.degree = degree;
    }

    details() {
        console.log(`Teacher ${this.name} has ${this.degree}`);
    }
}

const teacher = new Teacher('Shivani', 42, 'M.Sc Maths');
teacher.walk();
teacher.details();