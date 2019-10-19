let a = -1;
let b = 2;
console.log(a, b);

function swap() {
    a = a + b;
    b = a - b;
    a = a - b;
}

console.log('before ->', a, b);
swap();
console.log('after  ->', a, b);
