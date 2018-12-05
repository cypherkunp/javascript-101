class Plane {
    constructor(seatingCapacity){
        this._seatingCapacity = seatingCapacity;
        this._wings = 2;
        this._maxSpeed = 300;
        this._altitude = 0;
    }

    get maxSpeed(){
        return this._maxSpeed;
    }
    set maxSpeed(maxSpeed){
        this._maxSpeed = maxSpeed;
    }
    fly(){
        console.log('Plane is now taking off.');
        this._altitude = 4000;
    }
}

var myPlane = new Plane(30);
console.log("My plane's max speed is > " + myPlane.maxSpeed);
// updating the planes speed to 310
myPlane.maxSpeed = 310;
console.log("My plane's upgraded max speed is > " + myPlane.maxSpeed);
