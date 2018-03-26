class Plane {
    constructor(seatingCapacity){
        this.seatingCapacity = seatingCapacity;
        this.wings = 2;
        this.maxSpeed = 300;
        this.altitude = 0;
    }

    getMaxSpeed(){
        return this.maxSpeed;
    }
}

var myPlane = new Plane(30);
console.log("My plane's max speed is > " + myPlane.getMaxSpeed());
