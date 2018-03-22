// JS doesn't support method overloading but there are ways to 
// to achieve such functionality in JS

// Way 1 - Using the opts object paramter 
function foo(a, b, opts) {

    console.log('a: ' + a);
    console.log('b: ' + b);
    if (opts === undefined) {
        opts = new Object();
    }
    console.log('opts.isCSV:' + opts.isCSV);
    console.log('opts.fileName: ' + opts.fileName);
    console.log('opts.newProperty: ' + opts.newProperty);

}

var exportFileName = "MyFile";

foo(1, 2, { "isCSV": "true", "fileName": exportFileName });
foo(2, 4, undefined);


// way 2 - keep adding the parameter to the right of the function just handle the undefined/null condition.

function sum(x, y, z, k) {
    let sum = 0;
    if (x) {
        sum += x;
    }
    if (y) {
        sum += y;
    }
    if (z) {
        sum += z;
    }
    if (k) {
        //TODO
    }
    return sum;
}

console.log('Sum of x is > ' + sum(1));
console.log('Sum of x and y is > ' + sum(1, 2));
console.log('Sum of x, y and z is > ' + sum(1, 2, 3));

