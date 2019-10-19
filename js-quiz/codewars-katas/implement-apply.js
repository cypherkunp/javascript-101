Function.prototype.myApply = function(obj, params) {
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
greet.myApply(person, ['hi', 23]);
