var Car = function (loc) {
    let obj = {loc:loc};
    obj.move = function () {
        this.loc++;
        console.log('loc is now > ' + this.loc);
    }
    return obj;
}

var Van = function (loc) {
    let obj = Car(loc);
    obj.grab = function () {
        console.log('inside grab of van.');
    }
    return obj;
}

var CopCar = function (loc) {
    let obj = Car(loc);
    obj.call = function () {
        console.log('making a call inside CopCar.');
    }
    return obj;
}

var amy = CopCar(1);
amy.move();
amy.call();

var ben = Van(9);
ben.move();
ben.grab();
