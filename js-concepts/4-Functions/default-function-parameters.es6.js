/*
To create a default parameter, you add an equal sign ( = ) and then whatever you want the parameter
to default to if an argument is not provided.
In the code above, both parameters have default values of strings, but they can be any JavaScript type!
*/

function greet(name = 'Student', greeting = 'Welcome') {
    return `${greeting} ${name}!`;
}

console.log(greet()); // Welcome Student!
console.log(greet('James')); // Welcome James!
console.log(greet('Richard', 'Howdy')); // Howdy Richard!