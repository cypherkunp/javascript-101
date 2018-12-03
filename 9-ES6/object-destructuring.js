const address = {
    street : 'M. G. Road',
    city : 'Mumbai',
    country : 'India'
};

// Assigning the object properties to constants
const {street, city, country} = address;
console.log(`Street: ${street}, City: ${city}, Country: ${country}`);

// Assigning a property with a different name
const {street: st} = address;
console.log(`Street: ${st}`);
