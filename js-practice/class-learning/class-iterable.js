class Range {
    constructor(from, to) {
        this.from = from;
        this.to = to;
    }

    [Symbol.iterator]() {
        this.current = this.from;
        return this;
    }

    next() {
        if (this.current > this.to) return { done: true };
        else {
            return {
                done: false,
                value: this.current++
            };
        }
    }
}

const myRange = new Range(1, 7);

for (const iterator of myRange) {
    console.log(iterator);
}
