const numObj = {
  a: 3,
  b: 6,
  c: 9,
  d: 98,
  e: 1
};

let sum = 0;
for (const key in numObj) {
  if (numObj.hasOwnProperty(key)) {
    sum += numObj[key];
  }
}

console.log('sum: ', sum);
