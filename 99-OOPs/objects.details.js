/**
 * Objects can be defined using two ways:
 * 1. Using object literal -> {}
 * 2. Using object constructor -> new Object();
 * 
 * */

var Phone = {
    make: "Samsung",
    model: "Note 9",
    ring: function (ringtone) {
        console.log(ringtone);
      }
}

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
Phone.switchOff = function () { 
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
phoneKeysArray = Object.keys(Phone);
// Looping Through Object Properties using for-of loop for arrays
for (const key of phoneKeysArray) {
    console.log(`${key} : ${Phone[key]}`);
}