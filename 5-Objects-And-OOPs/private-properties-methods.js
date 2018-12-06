// Approach 1: Using Symbol
const _radius = Symbol();
const _draw = Symbol();

class Circle {
    constructor(radius) {
            this[_radius] = radius;
        }
        [_draw]() {
            console.log('Drawing the circle with radius ', this._radius);
        }
}

const c = new Circle(1);
console.log(c);

// Approach 2: Using WeakMaps

const _length = new WeakMap();
const _drawSq = new WeakMap();

class Square {
    constructor(length) {
        _length.set(this, length);
        _drawSq.set(this, () => {
            console.log('Drawling the Square with length >', _length.get(this));
        })
    }

    draw() {
        _drawSq.get(this)();
    }
}

const sq = new Square(2);
sq.draw();