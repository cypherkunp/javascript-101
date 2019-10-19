function f(greet) {
    return class Greet {
        say() {
            console.log(greet);
        }
    };
}

// class syntax allows you to have any expression after extends
class User extends f('Hello') {}
/*
That may be useful for advanced programming patterns when we use functions to generate classes
 depending on many conditions and can inherit from them.
*/

const user = new User();
user.say();
