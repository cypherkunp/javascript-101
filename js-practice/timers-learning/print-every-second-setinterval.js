let count = 0;
let timerId = setInterval(() => {
    count++;
    console.log(count);
}, 1000);

setTimeout(() => {
    clearInterval(timerId);
}, 11000);
