function sayHi() {
  console.log(name);
  console.log(age);
  var name = 'Lydia';
  let age = 21;
}

sayHi(); // undefined and ReferenceError: Cannot access 'age' before initialization
