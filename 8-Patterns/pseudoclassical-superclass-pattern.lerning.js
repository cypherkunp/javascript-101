var Car = function (loc) {
    this.loc = loc;
}
Car.prototype.move = function (loc) {
    this.loc++;
}

var Van = function (loc) {
    Car.call(this, loc);
}

Van.prototype = Object.create(Car.prototype);
Van.prototype.grab = function () {
    console.log('Inside Grab!');
    
}

var zed = new Car(3);
zed.move();

var amy = new Van(9);
console.log(amy.loc);
amy.move();
amy.grab();