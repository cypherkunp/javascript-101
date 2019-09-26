class Car {
    constructor(type = 'hachback', color = 'white') {
        this.type = type;
        this.color = color;
        this.engineOn = false;
    }

    start() {
        console.log('Engine fired up!');
        this.engineOn = true;
    }

    stop() {
        console.log('Engine gunned down!');
        this.engineOn = false;
    }

    get _color() {
        return this.color;
    }

    get _engineOn() {
        return this.engineOn;
    }

    get _type() {
        return this.type;
    }
}

class Audi extends Car {
    constructor(type, color, topSpeed) {
        super(type, color); // super must be called before this
        this.topSpeed = topSpeed;
    }

    playMusic(songName) {
        console.log(`Playing the song ${songName}`);

    }

    get _topSpeed() {
        console.log('');

        return this.topSpeed;
    }
}

var audiR8 = new Audi('coupe', 'blood red', 250);
audiR8.start();
console.log("Is engine on? " + audiR8._engineOn);
audiR8.playMusic('cloud 9 by Brian Adams');
audiR8.stop();
console.log('Is engine on? ' + audiR8._engineOn);
console.log('top speed: ' + audiR8._topSpeed);
console.log('type: ' + audiR8._type);
console.log('color: ' + audiR8._color);

console.log('\nHatch Properties: ');
var hatch = new Car();
hatch.start();
console.log("Is engine on? " + hatch._engineOn);
hatch.stop();
console.log("Is engine on? " + hatch._engineOn);
console.log('type: ' + hatch._type);
console.log('color: ' + hatch._color);

console.log('\nChecking instanceof: ');
console.log('is audiR8 instance of Car >',  audiR8 instanceof Car);
console.log('is audiR8 instance of Audi >', audiR8 instanceof Audi);
console.log('is hatch instance of Car >',  hatch instanceof Car);
