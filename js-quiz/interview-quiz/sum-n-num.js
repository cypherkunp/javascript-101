const sum = (...a) => {
    const getTotal = args =>
        (args.length &&
            args.reduce((sum, e) => {
                return +sum + +e;
            })) ||
        0;

    let total = getTotal(a);

    function f(...b) {
        total += getTotal(b);
        return f;
    }

    f[Symbol.toPrimitive] = () => total;

    return f;
};

console.log(+sum('1', '2'));
console.log(+sum()(1, 2, 3));
console.log('' + sum(1)(2)(3)(-1));
console.log(+sum(1)(2)(3)(-1));
