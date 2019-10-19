/*
Property flags
Object properties, besides a value, have three special attributes (so-called “flags”):

writable – if true, can be changed, otherwise it’s read-only.
enumerable – if true, then listed in loops, otherwise not listed.
configurable – if true, the property can be deleted and these attributes can be modified,
 otherwise not.
*/

const user = {
    name: 'Devvrat',
    age: 34,
    about() {
        return `${this.name} | ${this.age}`;
    }
};

function getObjectDetails(obj) {
    for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
            const element = obj[key];
            console.log(key, ' : ', element);
        }
    }
}

let descriptor = Object.getOwnPropertyDescriptor(user, 'name');
console.log(' user descriptor: ', descriptor);
/*
descriptor:  { value: 'Devvrat',
  writable: true,
  enumerable: true,
  configurable: true }
*/

descriptor = Object.getOwnPropertyDescriptor(user, 'age');
console.log(' age descriptor: ', descriptor);

descriptor = Object.getOwnPropertyDescriptor(user, 'about');
console.log(' about descriptor: ', descriptor);

// Defining another property using Object.defineProperty

Object.defineProperty(user, 'location', {
    value: 'Pune',
    writable: false,
    enumerable: false,
    configurable: false
});

// trying to change user location
console.log('---');
user.location = 'Mumbai'; // this wont set as the property is read only
console.log('user.location: ', user.location);

// looping over properties, location should not appear
console.log('---');
getObjectDetails(user);
/*
Output: 

name  :  Devvrat
age  :  34
about  :  about() {
        return `${this.name} | ${this.age}`;
    }
*/

// trying to delete location and age property
// location is non configurable and age is configurable

delete user.age; // this will be deleted
delete user.location; // this will not be deleted

console.log('---');
console.log('is age property present: ', user.hasOwnProperty('age'));
console.log('is location property present: ', user.hasOwnProperty('location'));
