var gold = {
    a: 1
};

console.log(gold.a);
console.log(gold.z);


// one time copy

/* var blue = extend({}, gold);
blue.b = 2;

console.log(blue.a);
console.log(blue.b);
console.log(blue.z);
 */
// prototype chain look up

var rose = Object.create(gold);
rose.b =  3;
console.log(rose.a);
console.log(rose.b);
console.log(rose.z);

gold.z = 5;
console.log(gold.z);
console.log(rose.z);


