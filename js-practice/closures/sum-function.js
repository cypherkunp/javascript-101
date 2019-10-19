function sum(value) {
    let total = value;

    function f(addValue) {
        total += addValue;
        return f;
    }

    f.toString = function() {
        return total;
    };

    return f;
}

console.log(`${sum(1)(2)}`);
console.log(+sum(1)(2)(10)(-5));
