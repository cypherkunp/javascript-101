const someString = 'HelloWorld';
const someStringSmall = someString.toLowerCase(someString);
const charArray = [...someStringSmall];

let max = '';
for (const char of charArray) {
  max = char > max ? char : max;
}

console.log('Max char is> ', max);
