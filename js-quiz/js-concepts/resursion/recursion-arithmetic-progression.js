function ap(n) {
    return n === 1 ? 1 : n + ap(n - 1);
}

console.log(ap(3));
console.log(ap(4));
console.log(ap(5));
