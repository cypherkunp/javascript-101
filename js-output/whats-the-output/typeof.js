array = [0, false, '', null, undefined, NaN, {}];

array.forEach(element => {
  let warning = ' ';
  if (element === null) {
    warning = '-> This is a bug in JavaScript';
  }
  console.log(`${element}: ${typeof element} ${warning}`);
});

/* OUTPUT
0: number
false: boolean
: string
null: object -> This is a bug in JavaScript
undefined: undefined
NaN: number
[object Object]: object
*/
