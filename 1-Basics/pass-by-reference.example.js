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
