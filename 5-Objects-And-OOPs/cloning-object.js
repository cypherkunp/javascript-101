let company = {
  name: 'Apple',
  headQuaters: 'California'
};

let address = {
  company: { ...company },
  street: 'Loop One',
  city: 'Palo Alto',
  state: 'California',
  country: 'US'
};

let employees = [
  {
    name: 'Steve Jobs',
    age: 56,
    designation: 'CEO'
  },
  {
    name: 'Steve Woz',
    age: 53,
    designation: 'CTO'
  }
];

let cloneCompany = {};
let anotherCompany = { ...company }; // spread syntax ES6
Object.assign(cloneCompany, company);

console.log('company: ', company);
console.log('clone of company: ', cloneCompany);
console.log('another clone of company: ', anotherCompany);
console.log(cloneCompany == company); // false
console.log(cloneCompany === company); // false
console.log(anotherCompany == company); // false
console.log(anotherCompany === company); // false

console.log('address', address);
console.log(address.company == company);
console.log(address.company === company);
