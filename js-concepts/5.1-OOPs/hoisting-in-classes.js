// Class declaration or expression are NOT HOISTED! unlike function declarations

// const triangle = new Triangle(); // ReferenceError: Triangle is not defined
// const square = new Square(); // ReferenceError: Square is not defined

// Class declaration | Not hoisted | Can only be called after it is declared
class Triangle {
    constructor() {
        console.log('Triangle instance is created...');
    }
}

// Class expression | Not hoisted | Can only be called after it is declared
const Square = class {
    constructor() {
        console.log('Square instance is created...');
    }
}

const triangle = new Triangle();
const square = new Square();