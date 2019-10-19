let pressed = true;
let bolString = 'true';
let bolZero = 0;

function toggle() {
    pressed = !pressed;
}
console.log('pressed: ', pressed);
toggle();
console.log('unpressed: ', pressed);
console.log('unpressed: ', +pressed);
console.log(!!bolString);
console.log(!bolString);

console.log(!!bolZero);
console.log(!bolZero);

const condition = '';
!!condition ? sayHello() : sayBye();

function sayHello() {
    console.log('Hello');
}

function sayBye() {
    console.log('Bye');
}

let value1 = '';
let value2 = '';
let value3;
let value4 = null;
let value5 = 'Some Value';

// all falsy
let finalValue = value1 || value2 || value3 || value4 || 0;
// Returns the first truthy value | When all are false returns the last falsy value
console.log('ORing final value: ', finalValue);

finalValue = 'Hi' && 'HEllo' && value5;
// Returns the first falsy value | When all are true returns the last true value
console.log('ANDing final value: ', finalValue);
