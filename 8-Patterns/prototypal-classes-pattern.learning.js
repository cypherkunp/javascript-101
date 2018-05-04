var Car = function (loc) {
    var obj = Object.create(Car.methods);
    obj.loc = loc;
    return obj;    
}

Car.methods = {
    move: function () {
        this.loc++;
    }
};

// Prototypal classes pattern
var Truck = function (loc) {
    var obj = Object.create(Truck.prototype);
    obj.loc = loc;
    return obj; 
}

Truck.prototype.move = function () {
    this.loc++;
}

var amy = Truck(1);
amy.move();
var ben = Truck(9);
ben.move();

console.log(Truck.prototype.constructor);
console.log(amy.constructor);
console.log(amy instanceof Truck);

