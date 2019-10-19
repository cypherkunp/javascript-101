const allTypes = {
  a: 1,
  b: true,
  c: undefined,
  d: null,
  e: {},
  f: 'string',
  l: Symbol(),
  g: NaN,
  h: function() {},
  j: []
};

for (const key in allTypes) {
  if (allTypes.hasOwnProperty(key)) {
    const element = allTypes[key];
    console.log(element, ': ', typeof element);
  }
}
