function delayDecorator(func, delay = 0) {
    return function(...args) {
        setTimeout(() => {
            func.apply(this, args);
        }, delay);
    };
}

const print = message => console.log(message);
const printWithDelay = delayDecorator(print, 1000);

printWithDelay('Hello');
