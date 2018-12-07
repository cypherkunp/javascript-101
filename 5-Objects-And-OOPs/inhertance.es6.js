class Car {
    constructor(fuel, topSpeed) {
        this.fuel = fuel;
        this.topSpeed = topSpeed;
    }
    move() {
        console.log('Moving the car.');
    }
}

class Sedan extends Car {
    constructor(fuel, topSpeed, Model, transmission) {
        super(fuel, topSpeed);
        this.transmission = transmission;
    }
    openSunroof() {
        console.log('Opening the sunroof...');
    }
}

const car = new Car('petrol', 150);
car.move();

const elantra = new Sedan('diesel', 200, 'Hyundai Elantra', 'manual');
elantra.openSunroof();