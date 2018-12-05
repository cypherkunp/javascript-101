/*
- All objects in JavaScript descend from the parent Object constructor.
- Object has many useful built - in methods we can use and access to make working with individual
objects straightforward.
- Unlike Array prototype methods like sort() and reverse() that are used on
the array instance, Object methods are used directly on the Object constructor, and use the object
instance as a parameter.This is known as a static method.
- Here are the object methods that we'll be going through:
    Object.create()
    Object.keys()
    Object.values()
    Object.entries()
    Object.assign()
    Object.freeze()
    Object.seal()
    Object.getPrototypeOf()
*/

/*
1. Object.create()
--------------------------------------------------------------------------
The Object.create() method is used to create a new object and link it to the prototype of an existing object.
*/
// Initialize an object with properties and methods
const job = {
    position: 'cashier',
    type: 'hourly',
    location: 'Mumbai',
    isAvailable: true,
    showDetails() {
        const accepting = this.isAvailable ? 'is accepting applications' : "is not currently accepting applications";

        console.log(`The ${this.position} position is ${this.type} and ${accepting}.`);
    }
};

// Use Object.create to pass properties
const barista = Object.create(job);

barista.position = "barista";
barista.showDetails();

/*
2. Object.keys()
--------------------------------------------------------------------------
Object.keys() creates an array containing the keys of an object.
*/
const jobKeys = Object.keys(job);
console.log('\nKeys in the job object are:');
for (const key of jobKeys) {
    console.log(`- ${key}`);
}

// Object.keys() can be used to iterate through the keys and values of an object.
console.log('\nIterate through the keys and values of the job object:');
Object.keys(job).forEach(key => {
    let value = typeof job[key] === 'function' ? 'function' : job[key];
    console.log(`- ${key}: ${value}`);
})

// Object.keys() is also useful for checking the length of an object.
var jobObjectLength = Object.keys(job).length;
console.log('\nJob Object length is > ', jobObjectLength);

/*
3. Object.values()
--------------------------------------------------------------------------
Object.values() creates an array containing the values of an object.
*/
const jobValues = Object.values(job);
console.log('\nValues in the job object are:');
for (const jobValue of jobValues) {
    console.log(`- ${jobValue}`);
}

// Object.keys() and Object.values() allow you to return the data from an object.

/*
4. Object.entries()
--------------------------------------------------------------------------
Object.entries() creates a nested array of the key / value pairs of an object.
*/

const jobEntries = Object.entries(job);
console.log('\nEntires in the job objects are:');
console.log(jobEntries);

// Looping through the entries of an object using Object.entries() and forEach
console.log('\nLooping through the entries of an object using Object.entries():');
Object.entries(job).forEach(entry => {
    console.log(`${entry[0]} : ${entry[1]}`);
});

// Note: The Object.entries() method will only return the object instance's own properties,
// and not any properties that may be inherited through its prototype.

/*
5. Object.assign()
--------------------------------------------------------------------------
Object.assign() is used to copy values from one object to another.
*/

// E.g. We can create two objects, and merge them with Object.assign().
const empName = {
    first: 'Elon',
    last: 'Musk'
};

const empDetails = {
    job: 'CEO',
    company: 'Tesla & SpaceX'
};

const empBio = Object.assign(empName, empDetails);
console.log('\nMerged object of empName and empDetails');
console.log(empBio);

// It is also possible to use the spread operator (...) to accomplish the same task.
// In the code below, we'll modify how we declare character through merging the name and details objects.

const empBios = { ...empName,
    ...empDetails
};
console.log('\nMerged object of empName and empDetails using spread operator');
console.log(empBios);
// This spread syntax in object literals is also known as shallow-cloning.
// Note that Object.assign() triggers setters whereas spread syntax doesn't.

/*
Object.freeze():
--------------------------------------------------------------------------
Object.freeze() prevents modification to properties and values of an object,
and prevents properties from being added or removed from an object.
*/

Object.freeze(job);
job.location = 'Delhi';
job.position = 'Sales Manager';
job.active = true;

console.log('\nAfter freezing the job object and updating its values:');
console.log(job);

// Object.isFrozen() is available to determine whether an object has been frozen or not,
// and returns a Boolean.
console.log(`\nIs job freezed? ${Object.isFrozen(job)}`);

/*
Object.seal()
--------------------------------------------------------------------------
Object.seal() prevents new properties from being added to an object,
but allows the modification of existing properties.

This method is similar to Object.freeze().
*/

const fruit = {
    name: 'Guava',
    season: 'Winters'
}

Object.seal(fruit);
fruit.name = 'Kiwi';
fruit.color = 'yellow';

console.log('\nAfter sealing the fruit object and updating its values:');
console.log(fruit);
//The new color property was not added to the sealed object,
// but the name property was successfully changed.

console.log(`\nIs fruit sealed? ${Object.isSealed(fruit)}`);


/*
Object.getPrototypeOf()
Object.getPrototypeOf() is used to get the internal hidden[[Prototype]] of an object,
also accessible through the __proto__ property.
*/

// In this example, we can create an array, which has access to the Array prototype.
const prototype1 = {};
const object1 = Object.create(prototype1);
console.log('\nComparing the prototypes of prototype1 and object1 > ', Object.getPrototypeOf(object1) === prototype1);
// expected output: true
