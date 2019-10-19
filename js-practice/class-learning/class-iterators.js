class Laptop {
    constructor(make = 2000, model = '', forGaming = false) {
        this.make = make;
        this.model = model;
        this.forGaming = forGaming;
    }

    toString() {
        return `${this.make} | ${this.model} | ${this.forGaming}`;
    }
}

class MacBookPro extends Laptop{
    constructor(...params){
        super(...params);
        this.isRetinaDisplay = true;
    }
}

const laptop = new MacBookPro(2019, 'MacBookPro13');

// functions will not be listed when looping over class object keys
for (const key in laptop) {
    if (laptop.hasOwnProperty(key)) {
        console.log('internal: ', key);
    } else {
        console.log('inherited: ', key);
    }
}

console.log(`${laptop}`);
