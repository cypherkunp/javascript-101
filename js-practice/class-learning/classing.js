class Car {
    constructor(make, model, yearOfManufacture) {
        this.make = make;
        this.model = model;
        this.yearOfManufacture = yearOfManufacture;
    }

    about() {
        return `${this.make} | ${this.model}`;
    }

    static blowHorn() {
        console.log('beep beep');
    }
}

class MiniCooper extends Car {
    constructor(make, model, yearOfManufacture, topSpeed) {
        super(make, model, yearOfManufacture);
        this.topSpeed = topSpeed;
    }

    get topSpeed() {
        return this._topSpeed;
    }

    set topSpeed(topSpeed) {
        if (topSpeed < 200) {
            console.log('Top speed to low for mini');
            return;
        } else this._topSpeed = topSpeed;
    }
}

const mini = new MiniCooper('BMW', 'CooperS', '2018', 200);

// printing the object
console.log(mini);

// typeof
console.log('Type of Car: ', typeof Car);
console.log('Type of Car: ', typeof MiniCooper);

// calling methods
console.log(mini.about());
console.log(mini.topSpeed);
mini.topSpeed = 210;
console.log(mini.topSpeed);

// getting property names of the mini obj
console.log(Object.getOwnPropertyNames(mini));

// calling static methods
MiniCooper.blowHorn();
Car.blowHorn();

for (const key in MiniCooper) {
    if (MiniCooper.hasOwnProperty(key)) {
        console.log('Own property: ', key, ': ', MiniCooper[key]);
    } else {
        console.log('Inherited property: ', key, ' : ', MiniCooper[key]);
    }
}
