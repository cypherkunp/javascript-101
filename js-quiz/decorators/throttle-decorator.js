function throttleDecorator(func, ms) {
    let isThrottled = false;
    let savedArgs, savedThis;

    return function wrapper(...args) {
        if (isThrottled) {
            savedArgs = args;
            savedThis = this;
            return;
        }

        func.apply(this, args);
        isThrottled = true;

        setTimeout(() => {
            isThrottled = false;
            if (savedArgs) {
                func.apply(savedThis, savedArgs);
                savedArgs = savedThis = null;
            }
        }, ms);
    };
}

const printX = x => console.log(x);
const throttlePrintX = throttleDecorator(printX, 1000);

throttlePrintX(1);
throttlePrintX(2);
throttlePrintX(3);
throttlePrintX(4);

setTimeout(() => {
    throttlePrintX(5);
    throttlePrintX(6);
    throttlePrintX(7);
    throttlePrintX(8);
}, 1000);
