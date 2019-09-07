function User() {
    let _name = null;
    let _age = null;

    this.getName = () => _name;
    this.getAge = () => _age;
    this.setName = name => {
        _name = name;
    };
    this.setAge = age => {
        _age = age;
    };
}

const user1 = new User();
user1.setAge(12);
user1.setName('Devvrat');

console.log(user1.getName());
console.log(user1.getAge());
console.log(user1._age); //undefined

const user2 = new User();
user2.setAge(35);
user2.setName('Steve');

console.log(user2.getName());
console.log(user2.getAge());
