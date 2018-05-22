/*
If createGrid() is called without any argument then it will use this default empty array.
And since the array is empty, there's nothing to destructure into width and height,
so their default values will apply! So by adding = [] to give the entire parameter a default,
the following code will now work:
*/

// Defaults and destructuring arrays

function createGrid([width = 5, height = 6] = []) {
    console.log(`Generates a ${width} x ${height} grid.`);
}

createGrid();
createGrid([2]);
createGrid([, 2]);
createGrid([2, 2]);

// E.g 2

function houseDescriptor([houseColor = 'green', shutterColors = ['red']] = []) {
    var str = `I have a ${houseColor} house with ${shutterColors.join(' and ')} shutters`;
    console.log(str);

}
houseDescriptor();
houseDescriptor(['red', ['yellow', 'blue']]);
houseDescriptor(['blue']);
houseDescriptor(['green', ['white', 'gray', 'pink']]);

// Defaults and destructuring objects
/*
Just like array destructuring with array defaults,
a function can have an object be a default parameter and use object destructuring:
*/

function createSundae({ scoops = 1, toppings = ['Hot Fudge'] } = {}) {
    const scoopText = scoops === 1 ? 'scoop' : 'scoops';
    let txt = `Your sundae has ${scoops} ${scoopText} with ${toppings.join(' and ')} toppings.`;
    console.log(txt);
}

createSundae();
createSundae({});
createSundae({ scoops: 4 });
createSundae({ toppings: ['chicken soup', 'shezwan sause'] });
createSundae({ scoops: 4, toppings: ['chicken soup', 'shezwan sause'] });

// E.g. 2

function buildHouse({ floors = 1, color = 'red', walls = 'brick' } = {}) {
    return `Your house has ${floors} floor(s) with ${color} ${walls} walls.`;

}

console.log(buildHouse()); // Your house has 1 floor(s) with red brick walls.
console.log(buildHouse({})); // Your house has 1 floor(s) with red brick walls.
console.log(buildHouse({ floors: 3, color: 'yellow' })); // Your house has 3 floor(s) with yellow brick walls.

