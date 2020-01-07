a = [0, false, null, undefined, '', NaN, {}];

a.forEach(element => {
  if (element) {
    console.log(element, 'is truthy.');
  } else {
    console.log(element, 'is falsy.');
  }
});
