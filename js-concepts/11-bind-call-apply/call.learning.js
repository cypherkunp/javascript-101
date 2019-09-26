const person = {
    name: 'Devvrat'
}

function walk(speed){
    console.log(this.name + ' is walking at speed: ' + speed + 'km\/hr');
}

walk(40); // logs > undefined is walking at speed: 40

// associating a function with an object
walk.call(person, 30); // logs > Devvrat is walking at speed: 30