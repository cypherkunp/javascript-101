let booleanValue = true;
let nullValue = null;
let undefinedValue = undefined;
let symbolValue = Symbol(1);
let numberValue = '1';
let nanValue = NaN;

booleanValue = String(booleanValue);
nullValue = String(nullValue);
undefinedValue = String(undefinedValue);
symbolValue = String(symbolValue);
numberValue = String(numberValue);
nanValue = String(nanValue);

console.log('booleanValue:', booleanValue, '| typeof:', typeof booleanValue);
console.log('nullValue:', nullValue, '| typeof:', typeof nullValue);
console.log('undefinedValue:', undefinedValue, '| typeof:', typeof undefinedValue);
console.log('symbolValue:', symbolValue, '| typeof:', typeof symbolValue);
console.log('numberValue:', numberValue, '| typeof:', typeof numberValue);
console.log('nanValue:', nanValue, '| typeof:', typeof nanValue);

//-------------------------------------------

console.log(1 + '1'); // except + all others are treated a number calculation
console.log(1 / '2'); // except + all others are treated a number calculation
console.log(1 * '2'); // except + all others are treated a number calculation
console.log(1 - '1');
console.log(2 + 1 - '4');
console.log('2' + 1 - '4');
console.log(1 - '2s');
console.log(1 - '2s');
