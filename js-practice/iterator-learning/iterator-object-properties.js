const userNotIterable = {
    name: 'Devvrat',
    contact: 9890763747,
    say() {
        console.log('Hello there');
    }
};

/* for (const iterator of userNotIterable) {
    console.log(iterator); //TypeError: userNotIterable is not iterable
} */

const userIterable = {
    name: 'Devvrat',
    contact: 9890763747,
    say() {
        console.log('Hello there');
    },
    *[Symbol.iterator]() {
        for (const key in this) {
            if (this.hasOwnProperty(key)) {
                yield this[key];
            }
        }
    }
};

for (const iterator of userIterable) {
    console.log(iterator);
}
