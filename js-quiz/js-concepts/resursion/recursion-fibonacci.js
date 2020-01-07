function nthFibonacci(n) {
    return n <= 1 ? n : nthFibonacci(n - 1) + nthFibonacci(n - 2);
}

console.log(nthFibonacci(2));
