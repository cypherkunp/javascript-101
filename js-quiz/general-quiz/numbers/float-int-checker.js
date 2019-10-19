function isInt(number) {
  return number % 1 === 0;
}

function isFloat(number) {
  return number % 1 !== 0;
}

console.log('isInt 1.2 >', isInt(1.2));
console.log('isFloat 1.2 >', isFloat(1.2));

console.log('isInt 12 >', isInt(12));
console.log('isFloat 12 >', isFloat(12));
