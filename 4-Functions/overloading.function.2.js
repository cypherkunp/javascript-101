// 1
function sayHello(name) {
  return `Hello ${name}!`;
}

//2
function sayHello(name, message) {
  return `Hello ${name}, ${message}!`;
}

// function 2 will be called, which is the last defined function with the same name in order
console.log('sayHello:', sayHello('Devvrat'));
