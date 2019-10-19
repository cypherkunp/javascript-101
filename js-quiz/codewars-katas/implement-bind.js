Function.prototype.myBind = function(newThis) {
    if (typeof this !== 'function') {
        throw new Error(this + "cannot be bound as it's not callable");
    }
    const boundFunction = this;
    return function() {
        if (new.target) throw new Error(this + 'new cannot be invoked on this function');
        return boundFunction.apply(newThis, [...arguments]);
    };
};

const person = {
    name: 'devvrat'
};

function greet(message) {
    console.log(`${message}, ${this.name}`);
}

greet('hello'); // return => hello, undefined
const personWithBind = greet.myBind(person);
personWithBind('Hi'); // returns => Hi, devvrat

const personWithBindNew = new personWithBind(58);
console.log(personWithBindNew);
