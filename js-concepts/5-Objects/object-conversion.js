const user = {
  name: 'Devvrat',
  location: 'India',
  age: 33,
  toString() {
    return `[name: ${this.name}]`;
  },
  valueOf() {
    return this.age;
  }
};
const userValue = +user;
const userString = user.toString();
console.log(userString);
console.log(userValue);

console.log(50 + user);
console.log('Hello' + user);
