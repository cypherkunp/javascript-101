// not calling super

class Animal {
    constructor(name) {
        this.eats = true;
        this.name = name;
    }
}

class Rabbit extends Animal {
    constructor(...params) {
        //super(...params);
        this.jumps = true;
    }
}

//ReferenceError: Must call super constructor in derived class before accessing 'this' or returning from derived constructor
const rabbit = new Rabbit('Jumpu');
//console.log(rabbit.name);
