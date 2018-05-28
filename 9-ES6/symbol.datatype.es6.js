// New built -in datatype in ES6

/*
A symbol is a unique and immutable data type that is often used to identify object properties.
To create a symbol, you write Symbol() with an optional string as its description.
*/

const sym1 = Symbol('apple');
console.log(sym1);

// comparing two symbols
const sym2 = Symbol('banana');
const sym3 = Symbol('banana');
console.log(sym2 === sym3);


let bowl = {
    'apple': { color: 'red', weight: 136.078 },
    'banana': { color: 'yellow', weight: 183.151 },
    'orange': { color: 'orange', weight: 170.097 },
    'banana': { color: 'yellow', weight: 176.845 }
};
console.log(bowl);

/*
Instead of adding another banana to the bowl,
our previous banana is overwritten by the new banana being added to the bowl.
To fix this problem, we can use symbols.
*/
bowl = {
    [Symbol('apple')]: { color: 'red', weight: 136.078 },
    [Symbol('banana')]: { color: 'yellow', weight: 183.15 },
    [Symbol('orange')]: { color: 'orange', weight: 170.097 },
    [Symbol('banana')]: { color: 'yellow', weight: 176.845 }
};
console.log(bowl);
/*
By changing the bowl’s properties to use symbols,
each property is a unique Symbol and the first banana
 doesn’t get overwritten by the second banana.
 */




