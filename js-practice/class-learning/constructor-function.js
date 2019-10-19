function User(name, age) {
    this.name = name;
    this.age = age;
}

User.prototype.talk = function() {
    console.log(`{this.name}, is talking...`);
};

function Employee(department, salary) {
    User.call(this);
}
