const user = {
    name: 'Bill',
    surname: 'Gates',
    get fullName() {
        return `${this.name} ${this.surname}`;
    },
    set fullName(fullName) {
        [this.name, this.surname] = fullName.split(' ');
    },
    get age() {
        return this._age;
    },
    set age(age) {
        this._age = age;
    }
};

// property descriptors

console.log(Object.getOwnPropertyDescriptor(user, 'age'));

console.log(user.fullName);
console.log(user.age);

user.fullName = 'Steve Jobs';
user.age = 55;
console.log(user.fullName);
console.log(user.age);

delete user.name;
delete user.age;

console.log(user.fullName);
console.log(user.age);
