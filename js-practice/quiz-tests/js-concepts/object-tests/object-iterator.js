const sapien = {
    cognition: true
};

const human = {
    drinks: 'Water',
    __proto__: sapien
};

const user = {
    name: 'Jhon',
    age: 22,
    toString() {
        return this.name;
    },
    walk() {
        return `${this.name} is walking...`;
    },
    __proto__: human
};

for (const key in user) {
    if (user.hasOwnProperty(key)) {
        console.log(`Own Key - Value: ${key} - ${user[key]}`);
    } else {
        console.log(`Inherited Key - Value: ${key} - ${user[key]}`);
    }
}

console.log();
console.log('Object Keys: ', Object.keys(user));
console.log('Object Entries', Object.entries(user));
console.log('Object Values', Object.values(user));
