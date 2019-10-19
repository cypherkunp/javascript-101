function user(name = '', age = 0) {
    let _name = name;
    let _age = age;

    return {
        get name() {
            return _name;
        },
        set name(name) {
            _name = name;
        },
        get age() {
            return _age;
        }
    };
}

const user1 = user('Devvrat', 32);
console.log(user1.name);
console.log(user1.age);

user1.name = 'Devvrat Shukla';
user1.age = 33;

console.log(user1.name);
console.log(user1.age);
