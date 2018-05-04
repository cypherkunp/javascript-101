
// functions class pattern or functional shared pattern

var Car = function (loc) {
    obj = { loc: loc };
    obj.move = move; // this only creates one instance of move function object.
    /*
    // this will create a new move function object every time a Car object is created.
    // Thus this is not a recommended approach as it every object will consume more memory.
    obj.move = function () {
        obj.loc++;
    };
    */
    return obj;
};

var move = function () {
    this.loc++;
};

// game logic
var amy = Car(1);
amy.move();
console.log(amy.loc);


var ben = Car(2);
ben.move();
console.log(ben.loc);