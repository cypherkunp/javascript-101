class Animal {
    constructor(name) {
        this.name = name;
    }

    talk() {
        console.log(`${this.name} is talking`);
    }
}

class Cat extends Animal {
    constructor(name) {
        super(name);
    }

    walk() {
        console.log(`${this.name} is walking`);
    }

    command() {
        this.walk();
    }
}

const cat = new Cat('MeowTong');
cat.talk();
cat.command();

var name = 'devvrat';
var walk = cat.walk;
walk();
