function sayHello(name = 'Jhon') {
    console.log('Hello', name);
}

//So the function is scheduled to run “right after” the current code.
setTimeout(sayHello); // this is called second
sayHello('Devvrat'); // this is called first
