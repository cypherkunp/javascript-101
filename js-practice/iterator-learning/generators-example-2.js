function* generateSequence() {
    yield 1;
    yield 2;
    yield 3;
}
const sequence = generateSequence();
let value = 0;

do {
    next = sequence.next();
    const newLocal = '';
    !next.done ? console.log(next.value) : newLocal;
} while (!next.done);
