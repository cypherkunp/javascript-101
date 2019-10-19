// referencing __proto__ in circle
const pug = {};
const dog = {
    barks: true,
    __proto__: pug
};
pug.color = 'white';
pug.__proto__ = dog; // TypeError: Cyclic __proto__ value
