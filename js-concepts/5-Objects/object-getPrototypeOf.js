const book = {
    title: 'Fountainhead'
};

const prototype = Object.getPrototypeOf(book);
console.log('book object prototype: ', prototype);
console.log('Object prototype: ', Object.prototype);
console.log('Is Object.prototype equals Object.getPrototypeOf(book): ', Object.prototype === prototype);
console.log('Is Object.isPrototypeOf(book): ', Object.isPrototypeOf(book));
