/**
 * If you pass an object(i.e.a non - primitive value, such as Array or a user - defined object)
 *  as a parameter and the function changes the object 's properties, that change is visible outside
 *  the function, as shown in the following example:
 */

 var me = {
     name: 'Devvrat',
     contact: '9890763747',
     profession: 'Software'
 }

function updateName(details) {
    details.name = 'Updated';
}

console.log(me);
updateName(me);
console.log(me); // Name will be updated to 'Updated'


var array1 = [];
array1.push(1);

console.log(array1);

// Now both array1 and array2 are pointing to the same memory location
// So, if you update array1 then the changes will be reflected on array2 as well.
var array2 = array1;
array1.push(2);

console.log(array1);
console.log(array2);

array2.push(3);
console.log(array1);
console.log(array2);