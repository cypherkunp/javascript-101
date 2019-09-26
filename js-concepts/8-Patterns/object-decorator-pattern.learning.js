
// decorator function

var carLike = function (obj, loc) {
    obj.loc = loc;
    obj.move = function () {
        obj.loc++;
    };
    return obj;
};

// game logic
var amy = carLike({}, 1);
amy.move();
console.log(amy.loc);


var ben = carLike({}, 2);
ben.move();
console.log(ben.loc);

// The class builds the object that it's going to augment. 
// The decorator accepts the object that it's going to augment as an input.

