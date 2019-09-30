/*
When we call a “debounced” function, it guarantees that all future calls to the function made less 
than ms milliseconds after the previous call will be ignored.
*/

function debounceDecorator(func, ms) {
    let debounce = false;

    return function(...args) {
        if (debounce) return;
        func.apply(this, args);
        debounce = true;

        setTimeout(() => {
            debounce = false;
        }, ms);
    };
}

const print = message => console.log(message);
const printWithDebounce = debounceDecorator(print, 1000);

printWithDebounce('Print1');
printWithDebounce('Print2'); //skipped
printWithDebounce('Print3'); // skipped

setTimeout(() => {
    printWithDebounce('Print4');
}, 1000);
