function sayHi(phrase, who) {
    console.log(phrase + ', ' + who);
}

// setTimeout allows to run a function once after the interval of time.
setTimeout(sayHi, 1000, 'Hello', 'John'); // Hello, John
setTimeout(
    (greet, name) => {
        console.log(greet + ', ' + name);
    },
    10,
    'Hello',
    'Dev'
); // Hello, John
