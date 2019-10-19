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
    Rectangle.call(this, size, size);
    // optional: add new properties or override existing ones here
}
Square.prototype = Object.create(Rectangle.prototype, {
    constructor: {
        configurable: true,
        enumerable: true,
        value: Square,
        writable: true
    }
});
Square.prototype.toString = function() {
    return '[Square ' + this.length + 'x' + this.width + ']';
};
var square = new Square(6);
console.log(square.length); // 6
console.log(square.width); // 6
console.log(square.getArea()); // 36
