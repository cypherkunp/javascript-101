class Range {
    constructor(from, to) {
        this.from = from;
        this.to = to;
    }

    *[Symbol.iterator]() {
        for (let value = this.from; value <= this.to; value++) {
            yield value;
        }
    }
}

const range = new Range(1, 5);

for (const iterator of range) {
    console.log(iterator);
}
