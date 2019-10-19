function factorial(n) {
    return n === 1 ? 1 : n * factorial(n - 1);
}

console.log(factorial(3));
console.log(factorial(4));
console.log(factorial(5));
