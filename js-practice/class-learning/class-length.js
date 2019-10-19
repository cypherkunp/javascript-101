class User {
    constructor(name, contact, location) {
        this._name = name;
        this._contact = contact;
        this._location = location;
    }

    get name() {
        return this._name;
    }

    set name(value) {
        this._name = value;
    }

    get length() {
        return Object.keys(this).length;
    }
}

const user = new User('Devvrat', '34233423', 'Mumbai');
console.log(user.name);
console.log(user.length);

user.name = 'Jhon';
console.log(user.name);
user.length = 4;
console.log(user.length);
