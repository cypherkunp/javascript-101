/**
 * Objects can be defined using two ways:
 * 1. Using object literal -> {}
 * 2. Using object constructor -> new Object();
 *
 * */

var Phone = {
  make: 'Samsung',
  model: 'Note 9',
  ring: function(ringtone) {
    console.log(ringtone);
  }
};

// Accessing Object Properties

// Viewing the object properties and methods

// Using the . (dot) notation
console.log(`make of the phone is > ${Phone.make}`);

// Using the [] (bracket) notation
console.log(`model of the phone is > ${Phone['model']}`);

// Calling the object method
Phone.ring('Hey Brother -Avicci');

// Adding and Modifying Object Properties

// Add using . notation
Phone.serialNo = 12345;
console.log(`serial no of the phone is > ${Phone.serialNo}`);

// Add using the [] notation
Phone['made-in'] = 'China';
console.log(`serial no of the phone is > ${Phone['made-in']}`);

// Adding a method
Phone.switchOff = function() {
  return 'Phone is switching off...';
};
console.log(Phone.switchOff());

// Updating using . notation
Phone.model = 'S907';
console.log(`updated model of the phone is > ${Phone['model']}`);

// Removing Object Properties

// Removing using delete
var remove = delete Phone.make;
console.log(`Removed Phone.make > ${remove} | ${Phone.make}`);

// Looping Through Object Properties using for-in loop
console.log('\nProperties of the Phone are (for-in loop):');

for (const key in Phone) {
  if (Phone.hasOwnProperty(key)) {
    const element = Phone[key];
    console.log(`${key}. : ${element}`);
  }
}

console.log('\nProperties of the Phone are (Object.keys() and for-of loop):');
// Using object.keys
var phoneKeysArray = Object.keys(Phone);

// Looping Through Object Properties using for-of loop for arrays
for (const key of phoneKeysArray) {
  console.log(`${key} : ${Phone[key]}`);
}

// in
/**
The in operator looks for a property with a given name in a specific
object and returns true if it finds it.In effect, the in operator checks to see
if the given key exists in the hash table.For example, here’s what happens
when in is used to check for some properties in the person1 object:
 */

var person1 = {
  name: 'Devvrat',
  age: 21
};
console.log('Is name property present in person1', 'name' in person1); // true
console.log('Is age property present in person1', 'age' in person1); // true
console.log('Is title property present in person1', 'title' in person1); // false

/**
 * Keep in mind that not all properties are enumerable.
 * In fact, most of the native methods on objects have their [[Enumerable]] attribute set to false.
 * You can check whether a property is enumerable by using the propertyIsEnumerable() method,
 * which is present on every object:
 */

console.log('name' in person1); // true
console.log(person1.propertyIsEnumerable('name')); // true
var properties = Object.keys(person1);
console.log('length' in properties); // true
console.log(properties.propertyIsEnumerable('length')); // false

// Accessor Property
/**
 * There is a special syntax to define an accessor property using an
object literal:
 */
var person3 = {
  _name: 'Nicholas',
  get name() {
    console.log('Reading name');
    return this._name;
  },
  set name(value) {
    console.log('Setting name to %s', value);
    this._name = value;
  }
};
console.log(person3.name); // "Reading name" then "Nicholas"
person3.name = 'Greg';
console.log(person3.name); // "Setting name to Greg" then "Greg"
/**
 * This example simply adds logging to the behavior of the property;
 *  there’s usually no reason to use accessor properties if you are only storing the
data in another property—just use the property itself. 
Accessor properties are most useful when you want the assignment of a value to trigger
 some sort of behavior, or when reading a value requires the calculation of the desired return value
 
 Note: You don’t need to define both a getter and a setter; you can choose one or both.
If you define only a getter, then the property becomes read-only, 
and attempts to write to it will fail silently in nonstrict mode and throw an error in strict mode.
If you define only a setter, then the property becomes write-only,
 and attempts to read the value will fail silently in both strict and nonstrict modes
 */
