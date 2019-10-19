Function.prototype.myCall = function(obj, ...params) {
    obj.fn = this;
    return obj.fn(...params);
};

const person = {
    name: 'devvrat'
};

function greet(message, age) {
    console.log(`${message}, ${this.name}. You are ${age}`);
}

greet('hello');
greet.myCall(person, 'hi', 23);
