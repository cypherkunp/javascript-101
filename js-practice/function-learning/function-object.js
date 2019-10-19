function makeCounter() {
    let count = 0;
    function counter() {
        return count;
    }
    counter.set = c => (count = c);
    counter.decrement = () => (count -= 1);
    counter.increment = () => (count += 1);

    return counter;
}

const counter = makeCounter();
console.log(counter());
console.log(counter.increment());
console.log(counter.increment());
console.log(counter.decrement());
console.log(counter.set(1));
