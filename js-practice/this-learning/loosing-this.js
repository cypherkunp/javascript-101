const users = {
    greetHello: 'Hello',
    greetHi: 'Hi',
    greetBye: 'Bye',
    names: ['Ana', 'Jhon', 'Steve', 'Mike'],
    say() {
        this.names.forEach(name => {
            console.log(`${this.greetHello}, ${name}`);
        });
    },
    dontSay() {
        this.names.forEach(function(name) {
            console.log(`${this.greetHello}, ${name}`);
        });
    },
    sayHello() {
        return () => this.names.forEach(name => console.log(`${this.greetHello}, ${name}`));
    },
    sayHi() {
        const that = this;
        return function() {
            that.names.forEach(function(name) {
                console.log(`${that.greetHi}, ${name}`);
            });
        };
    },
    sayBye() {
        return function() {
            this.names.forEach(name => console.log(`${this.greetBye}, ${name}`));
        };
    }
};

hello = users.sayHello();
hi = users.sayHi();
bye = users.sayBye();

console.log('- users.say()');
users.say();

console.log('- users.dontSay()');
users.dontSay(); // this will loose this for greetHello cause of using function declaration inside forEach

console.log('- hello()');
hello(); // this will work cause of the arrow function that will bind to this from the outer lexical scope

console.log('- hi()');
hi(); // this will work cause of the closure

console.log('- bye()');
bye(); // this will loose this, as the returned function will have no reference to this...
