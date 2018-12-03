// JS doesn't support method overloading but there are ways to 
// to achieve such functionality in JS

// Way 1 - Using the opts object paramter 
function foo(a, b, opts) {

    console.log('a: ' + a);
    console.log('b: ' + b);
    if (opts === undefined) {
        opts = new Object();
    }
    try {
        console.log('opts.isCSV:' + opts.isCSV);
        console.log('opts.fileName: ' + opts.fileName);
        console.log('opts.newProperty: ' + opts.meta.type);
    } catch (error) {
        console.log('[Error] ', error.message);
    }
}

var exportFileName = "MyFile";
console.log('\nCalling foo with values 1,2, obj >');
foo(1, 2, {
    "isCSV": "true",
    "fileName": exportFileName,
    "meta": {
        "type": "text"
    }
});
console.log('\nCalling foo with values 2, 4, undefined >');
foo(2, 4, undefined);


// way 2 - keep adding the parameter to the right of the function just handle the undefined/null condition.

function sum(x, y, z, k) {
    let sum = 0;
    if (x != undefined) {
        sum += x;
    }
    if (y != undefined) {
        sum += y;
    }
    if (z != undefined) {
        sum += z;
    }
    if (k != undefined) {
        //TODO
    }
    return sum;
}

console.log('Sum of x is > ' + sum(1));
console.log('Sum of x and y is > ' + sum(1, 2));
console.log('Sum of x, y and z is > ' + sum(1, 2, 3));

// Way 3 - THE BEST WAY - Using the arguments object

/**
The Arguments Object
JavaScript functions have a built - in object called the arguments object.

The argument object contains an array of the arguments used when the
function was called(invoked).

This way you can simply use a function to find(for instance) the highest value in a list of numbers:
Example >

x = findMax(1, 123, 500, 115, 44, 88);
*/

function findMax() {
    var i;
    var max = -Infinity;
    for (i = 0; i < arguments.length; i++) {
        if (arguments[i] > max) {
            max = arguments[i];
        }
    }
    return max;
}
console.log(`Max is > ${findMax(1, 123, 500, 115, 44, 88)}`);
