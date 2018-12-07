class Shape {
    draw(shape = 'Shape') {
        console.log(`Drawing a ${shape}.`);
    }
}

class Circle extends Shape {
    draw() {
        console.log('Drawing a circle.');
    }
}

class Square extends Shape {
    draw() {
        // calling the draw method of the parent class
        super.draw('Square');
    }
}

const shape = new Shape();
shape.draw(); // Drawing a Shape.

const circle = new Circle();
circle.draw(); // Drawing a circle.

const square = new Square();
square.draw(); // Drawing a Square.