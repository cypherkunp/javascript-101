const range = {
    from: 1,
    to: 10
};

range[Symbol.iterator] = function() {
    return {
        current: this.from,
        last: this.to,
        next() {
            if (this.current <= this.last)
                return {
                    done: false,
                    value: this.current++
                };
            else
                return {
                    done: true
                };
        }
    };
};

for (const num of range) {
    console.log(num);
}

//  Example 2

const accelerate = {
    from: 10,
    to: 100,

    [Symbol.iterator]() {
        this.current = this.from;
        return this;
    },

    next() {
        if (this.current < this.to)
            return {
                done: false,
                value: (this.current += 10)
            };
        else
            return {
                done: true
            };
    }
};

for (const speed of accelerate) {
    console.log(speed);
}
