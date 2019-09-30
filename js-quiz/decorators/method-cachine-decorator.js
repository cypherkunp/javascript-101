const worker = {
    someMethod() {
        return 22;
    },
    slow(x) {
        console.log(`Slow called with ${x}`);
        return x ** this.someMethod();
    }
};

function cachingDecorator(func) {
    const cache = new Map();

    return function(x) {
        if (cache.has(x)) return cache.get(x);

        const result = func.call(this, x);
        cache.set(x, result);
        return result;
    };
}

console.time('First Run -> worker.slow');
console.log(worker.slow(2));
console.timeEnd('First Run -> worker.slow');

console.time('Second Run -> worker.slow');
console.log(worker.slow(2));
console.timeEnd('Second Run -> worker.slow');

console.time('Third Run -> worker.slow');
console.log(worker.slow(2));
console.timeEnd('Third Run -> worker.slow');

worker.slow = cachingDecorator(worker.slow);
console.log();
console.time('First Run -> worker.slowCached');
console.log(worker.slow(2));
console.timeEnd('First Run -> worker.slowCached');

console.time('Second Run -> worker.slowCached');
console.log(worker.slow(2));
console.timeEnd('Second Run -> worker.slowCached');

console.time('Third Run -> worker.slow');
console.log(worker.slow(2));
console.timeEnd('Third Run -> worker.slow');
