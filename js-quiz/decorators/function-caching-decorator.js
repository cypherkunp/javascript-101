/*
CachingDecorator is a decorator: a special function that takes another function and alters its behavior.
*/

function cachingDecorator(func) {
    const cache = new Map();

    return function(x) {
        if (cache.has(x)) return cache.get(x);

        const result = func(x);
        cache.set(x, result);
        return result;
    };
}

const toPower22 = x => x ** 22;
const toPower22Cached = cachingDecorator(toPower22);

console.time('First Run -> toPower22');
console.log(toPower22(2));
console.timeEnd('First Run -> toPower22');
console.time('Second Run -> toPower22');
console.log(toPower22(2));
console.timeEnd('Second Run -> toPower22');

console.time('First Run -> toPower22Cached');
console.log(toPower22Cached(2));
console.timeEnd('First Run -> toPower22Cached');
console.time('Second Run -> toPower22Cached');
console.log(toPower22Cached(2));
console.timeEnd('Second Run -> toPower22Cached');
