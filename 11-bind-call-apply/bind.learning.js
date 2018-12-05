"use strict";

const person = {
    name: "Devvrat",
    walk: function (speed) {
        console.log(this.name + 'is walking at speed > ' + speed);
    }
};

person.walk(50); // returns => { name: 'Devvrat', walk: [Function: walk] }

// since walk is a function and functions are an object in js we can assign it to a var
const walk = person.walk;
//walk(); // returns error

// for this to get the correct context we need to use bind | binding this
// bind returns a function
const walkWithBind = person.walk.bind(person);
walkWithBind(40); // returns => { name: 'Devvrat', walk: [Function: walk] }