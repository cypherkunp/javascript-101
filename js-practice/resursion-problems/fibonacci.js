function fibNth(n) {
    return n <= 1 ? n : fibNth(n - 1) + fibNth(n - 2);
}

const nthFib = fibNth(7);
console.log(nthFib);

function fib(n) {
    let array = [1, 1];

    for (let index = 2; index < n; index++) {
        array[index] = array[index - 1] + array[index - 2];
    }

    return array;
}

console.log(fib(7));
