/*
Create a decorator spy(func) that should return a wrapper that saves all calls to function in its calls property.

Every call is saved as an array of arguments.
*/

function spy(func) {
    function wrapper(...args) {
        wrapper.calls.push(args);
        return func(...args);
    }
    wrapper.calls = [];

    return wrapper;
}

function work(a, b) {
    return a + b;
}

const workSpy = spy(work);

workSpy(1, 2);
workSpy(2, 3);

for (const call of workSpy.calls) {
    console.log('Calls', call.join());
}
