function Rectangle(length, width) {
    this.length = length;
    this.width = width;
}
Rectangle.prototype.getArea = function() {
    return this.length * this.width;
};
Rectangle.prototype.toString = function() {
    return '[Rectangle ' + this.length + 'x' + this.width + ']';
};

// inherits from Rectangle
function Square(size) {
    this.length = size;
    this.width = size;
}
Square.prototype = new Rectangle();
Square.prototype.constructor = Square;
Square.prototype.toString = function() {
    return '[Square ' + this.length + 'x' + this.width + ']';
};

const rect = new Rectangle(5, 10);
const square = new Square(6);

console.log(rect.getArea()); // 50
console.log(square.getArea()); // 36
console.log(rect.toString()); // "[Rectangle 5x10]"
console.log(square.toString()); // "[Square 6x6]"
console.log(rect instanceof Rectangle); // true
console.log(rect instanceof Object); // true
console.log(square instanceof Square); // true
console.log(square instanceof Rectangle); // true
console.log(square instanceof Object);
