function counting(params) {
    let count = 0;

    return function() {
        return ++count;
    };
}

let count = counting();

console.log(count());
console.log(count());
console.log(count());

// function properties
function getCount() {
    function count() {
        return count.counter++;
    }

    count.counter = 0;

    return count;
}

count = getCount();
console.log();
console.log(count.name);
console.log(count());
console.log(count());
console.log(count());
