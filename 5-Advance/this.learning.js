var fn = function (one, two) {
    console.log(one, two);
}

var fnThis = function (one, two) {
    console.log(this, one, two);
}

fn("Hello", "Hi");
fn({"greet": "Hi"}, {});
fn([1,2,3],["Hello", "hi"]);

var ofn = {};
ofn.method = fnThis;
// this gets a context only when a dot operation is called on an object;
ofn.method("Hello", "Hi");

// using call method

fnThis.call(ofn, 1, 2);
ofn.method.call(ofn, "call", "ofn.method.call");


// in case of callback function