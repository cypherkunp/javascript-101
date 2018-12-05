// defining a class 
function Plane(seatingCapacity) {
    this.wings = 2;
    this.speed = 100;
    this.altitude = 100;
    this.seatingCapacity = seatingCapacity;
}
// adding functions to the plane class via prototype
Plane.prototype.fly = function () {
    this.altitude = 3000;
}

function JetFighter() {
    this.speed = 500;
}
// extending the plane
JetFighter.prototype = new Plane(1);

// creating an instance of the plane
var myPlane = new Plane(20);
console.log("PLANE DETAILS:");
console.log("Plane's seating capacity > " + myPlane.seatingCapacity);
console.log("Plane altitude before take off > " + myPlane.altitude);
myPlane.fly();
console.log("Plane altitude after take off > " + myPlane.altitude);

// creating an instance of the jet fighter
var myJetFighter = new JetFighter();
console.log("\nJET DETAILS:");
console.log("Jet fighter speed > " + myJetFighter.speed);
console.log("Jet fighter seating capacity > " + myJetFighter.seatingCapacity);
console.log("Jet fighter altitude before take off > " + myJetFighter.altitude);
myJetFighter.fly();
console.log("et fighter altitude after take off > " + myJetFighter.altitude);
