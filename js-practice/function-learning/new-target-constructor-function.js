//Inside a function, we can check whether it was called with new or without it, using a special new.target property.

function User(name) {
    if (!new.target) return new User(name);
    this.name = name;
}

const user1 = new User('Mike');
const user2 = User('Steve'); // Without new handled by new.target

console.log(user1.name);
console.log(user2.name);
