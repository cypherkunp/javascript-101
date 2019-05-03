/**
 * Destructuring borrows inspiration from languages like Perl and Python
 * by allowing you to specify the elements you want to extract from an array or
 * object on the left side of an assignment. It sounds a little weird,
 * but you can actually achieve the same result as before, but with much less code;
 *  and it's still easy to understand
 */

//  Let’s take a look at both examples rewritten using destructuring.

const point = [10, 25, -34, 4, 6, 7];

const [x, y, z, ...rest] = point;
console.log('ES6 way > ', x, y, z, '| rest >', rest);

/*
TIP: You can also ignore values when destructuring arrays.
For example, const [x, , z] = point; ignores the y coordinate and discards it.
*/

// in ES5 this was achieved by

const pointES5 = [10, 25, -34];

const xES5 = pointES5[0];
const yES5 = pointES5[1];
const zES5 = pointES5[2];

console.log('ES5 way > ', xES5, yES5, zES5);

// Destructuring values from an object
const gemstone = {
  type: 'quartz',
  color: 'rose',
  carat: 21.29
};

const { type, color, carat } = gemstone;

console.log(type, color, carat);

/*
TIP: You can also specify the values you want to select when destructuring an object.
For example, let {color} = gemstone; will only select the color property from the gemstone object.
*/

// quiz What will be the output of getArea()
const circle = {
  radius: 10,
  color: 'orange',
  getArea: function() {
    return Math.PI * this.radius * this.radius;
  },
  getCircumference: function() {
    return 2 * Math.PI * this.radius;
  }
};

let { radius, getArea, getCircumference } = circle;
console.log(getArea());
