/*
ES5 "Class" Recap:

Since ES6 classes are just a mirage and hide the fact that prototypal
inheritance is actually going on under the hood,

let's quickly look at how to create a "class" with ES5 code:
*/

function Plane(name, numEngines) {
    this.name = name;
    this.numEngines = numEngines;
    this.enginesActive = false;
}

// methods "inherited" by all instances
Plane.prototype.startEngines = function () {
    console.log(`starting ${this.name} engines...`);
    this.enginesActive = true;
};

const richardsPlane = new Plane('richardsPlane', 1);
richardsPlane.startEngines();

const jamesPlane = new Plane('jamesPlane', 4);
jamesPlane.startEngines();

/*
Things to note for ES5 class syntax:
1. the constructor function is called with the new keyword
2. the constructor function, by convention, starts with a capital letter
3. the constructor function controls the setting of data on the objects that will be created
4. "inherited" methods are placed on the constructor function's prototype object
*/


// ES6 CLASSES

class Train{
    constructor(name, numEngines){
        this.name = name;
        this.numEngines = numEngines;
        this.enginesActive = false;
    }
    
    startEngines(){
        console.log(`starting ${this.name}'s ${this.numEngines} engines...`);
        this.enginesActive = true;
    }

    isEngineStarted(){
        console.log(this.enginesActive);
    }
}

let localTrain = new Train('R8', 12);
localTrain.isEngineStarted(); // false
localTrain.startEngines();
localTrain.isEngineStarted(); // true

console.log(typeof localTrain); // object
console.log(typeof Train); // function
console.log(typeof Plane); // function

// That's right— class is just a function! There isn't even a new type added to JavaScript.

/*
Benefits of classes:
1. Less setup
2. There's a lot less code that you need to write to create a function
3. Clearly defined constructor function
4. Inside the class definition, you can clearly specify the constructor function.
5. Everything's contained

All code that's needed for the class is contained in the class declaration.
Instead of having the constructor function in one place,
then adding methods to the prototype one-by-one, you can do everything all at once!
*/

// Inheritance: Extending a class using ES6

class BulletTrain extends Train {
    constructor(name, numEngines, topSpeed) {
        super(name, numEngines);
        this.topSpeed = topSpeed;
    }
    speed(){
        console.log(`Top speed is: ${this.topSpeed}km/hr`);
    }
}

const btrain = new BulletTrain('Rajdhani', 4, 300);
btrain.startEngines();
btrain.speed();