function* generateSequence() {
    yield 1;
    yield 2;
    yield 3;
}

let generator = generateSequence();
let generatorArr = [0, ...generateSequence()];
console.log(generatorArr);

for (const iterator of generator) {
    console.log('value', iterator);
}
