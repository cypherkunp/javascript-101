Array.prototype.myReduce = function(func, init) {
    let accumulator = init || null;

    for (let index = 0; index < this.length; index++) {
        accumulator = func(accumulator, this[index], index, this) || this[index] + accumulator;
    }

    return accumulator;
};

const myArr = [1, 2, 3, 4, 5];

myArr.myReduce((sum, current, index, array) => {
    console.log(`${sum} | ${current} | ${index}`);
}, 1);
