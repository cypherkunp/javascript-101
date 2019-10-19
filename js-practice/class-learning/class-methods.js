class Car {
    constructor(make, model) {
        this.make = make;
        this.model = model;
    }

    about() {
        return `${this.make} | ${this.model}`;
    }

    static blowHorn() {
        console.log('Beep Beep');
    }

    toString() {
        Car.blowHorn();
        return this.about();
    }
    valueOf() {
        return this.make;
    }
}

const car = new Car(2019, 'Maruti Alto');
console.log(`${car}`); // calls toString
console.log(+car); // calls valueOf
