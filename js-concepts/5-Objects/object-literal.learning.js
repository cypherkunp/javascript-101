const user = {
  name: 'Devvrat',
  sayHello() {
    return this.name + ' says hello!';
  },
  toString() {
    return this.name + 'Object';
  }
};

console.log(user);
console.log(user.sayHello());
