let booleanValue = true;
let nullValue = null;
let undefinedValue = undefined;
let numberValue = '1';
let nanValue = NaN;
let stringValue = 'asd';

booleanValue = Number(booleanValue);
nullValue = Number(nullValue);
undefinedValue = Number(undefinedValue);
numberValue = Number(numberValue);
nanValue = Number(nanValue);
stringValue = Number(stringValue);

console.log('booleanValue:', booleanValue, '| typeof:', typeof booleanValue);
console.log('nullValue:', nullValue, '| typeof:', typeof nullValue);
console.log('undefinedValue:', undefinedValue, '| typeof:', typeof undefinedValue);
console.log('numberValue:', numberValue, '| typeof:', typeof numberValue);
console.log('nanValue:', nanValue, '| typeof:', typeof nanValue);
console.log('stringValue:', stringValue, '| typeof:', typeof stringValue);

console.log('---');

console.log(NaN + 1);
console.log(undefined + 1);
console.log(null + 1);
console.log(true + 1);
