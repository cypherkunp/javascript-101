function decorator(func) {
    const cache = new Map();

    return function(x) {
        if (cache.has(x)) return cache.get(x);

        const result = func(x);
        cache.set(x, result);
    };
}

const raiseTo99 = x => x ** 99;
const fastRaiseTo99 = decorator(raiseTo99);

console.time('Fist Call');
console.log(fastRaiseTo99(2));
console.timeEnd('Fist Call');

console.time('Second Call');
console.log(fastRaiseTo99(2));
console.timeEnd('Second Call');
