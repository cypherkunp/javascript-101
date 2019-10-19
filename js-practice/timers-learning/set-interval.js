// setInterval allows to run a function regularly with the interval between the runs.

let count = 0;

const intervalID = setInterval(
    (greet, name) => {
        console.log(greet + ', ' + name);
    },
    1000,
    'hello',
    'devvrat'
);

// clearing the set interval
setTimeout(() => {
    clearInterval(intervalID);
}, 10000);
