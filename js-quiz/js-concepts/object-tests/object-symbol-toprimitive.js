const obj = {
    name: 'Devvrat',
    age: 33,
    married: true,
    [Symbol.toPrimitive](hint) {
        if (hint === 'number') return this.age;
        else if (hint === 'string') return this.name;

        return `${this.age} | ${this.name}`;
    }
};

console.log(`${obj}`); // string
console.log(+obj); // number
console.log(obj + ''); // default
