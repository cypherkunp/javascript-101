function pow(a, b) {
    return b == 1 ? a : a * pow(a, b - 1);
}

console.log(pow(2, 3));
console.log(pow(3, 3));
