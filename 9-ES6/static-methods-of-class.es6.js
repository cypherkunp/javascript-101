/*
Static methods
To add a static method, the keyword static is placed in front of the method name.
Look at the badWeather() method in the code below:
*/

class Plane {
    constructor(numEngine, name) {
        this.name = name;
        this.numEngine = numEngine;
        this.enginesActive = false;
    }

    static badWeather(planes) {
        for (let plane of planes) {
            console.log(`Stopping engines of ${plane.name} due to badWeather Indication!`);
            plane.enginesActive = false;
        }
    }

    startEngines() {
        console.log(`${this.name}'s Engine fired up!`);
        this.enginesActive = true;
    }
}

let plane1 = new Plane(2, 'plane1');
plane1.startEngines();
let plane2 = new Plane(3, 'plane2');
plane2.startEngines();
let plane3 = new Plane(4, 'plane3');
plane3.startEngines();


Plane.badWeather([plane1, plane2, plane3]);

/*
Things to look out for when using classes
1. class is not magic
    The class keyword brings with it a lot of mental constructs from other, class-based languages.
    It doesn't magically add this functionality to JavaScript classes.
2. class is a mirage over prototypal inheritance
    We've said this many times before, but under the hood, a JavaScript class just uses prototypal inheritance.
3. Using classes requires the use of new
    When creating a new instance of a JavaScript class, the new keyword must be used
*/