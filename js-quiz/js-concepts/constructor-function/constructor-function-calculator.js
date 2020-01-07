function Calculator() {
    this.read = function(a, b) {
        this.a = a;
        this.b = b;
    };
    this.sum = function() {
        return this.a + this.b;
    };
    this.multiply = function() {
        return this.a * this.b;
    };
}

const calculator = new Calculator();
calculator.read(1, 2);
console.log('Sum = ', calculator.sum());
console.log('Multiply = ', calculator.multiply());
