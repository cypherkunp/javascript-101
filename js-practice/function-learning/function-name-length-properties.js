function greetFD(message = 'hi', name = '') {
    console.log(message, ',', name);
}

const greetFE = function(name, message) {
    console.log(message, name);
};

const greetFA = (name, message) => console.log('Hi', name);

console.log('Function Declaration -> ');
console.log(greetFD.name);
console.log(greetFD.length); // doesn't work with declaration
console.log('Function Expression -> ');
console.log(greetFE.name);
console.log(greetFE.length);
console.log('Function Arrow -> ');
console.log(greetFA.name);
console.log(greetFA.length);
