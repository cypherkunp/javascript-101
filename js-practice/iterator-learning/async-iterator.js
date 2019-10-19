const range = {
    from: 1,
    to: 9,
    [Symbol.asyncIterator]() {
        this.current = this.from;
        return this;
    },

    async next() {
        if (this.current <= this.to) {
            await new Promise(resolve => setTimeout(resolve, 1000));
            return {
                value: this.current++,
                done: false
            };
        } else {
            return {
                done: true
            };
        }
    }
};

(async () => {
    for await (const value of range) {
        console.log(value);
    }
})();
