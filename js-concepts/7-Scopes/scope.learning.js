// functional scope
var a = 1;
function sayHello() {
    var a = "[Info] I am defined inside function sayHello";
    if (a) {
        var b = "[Info] I am defined inside an if statement";
    }

    for (let i = 0; i < 1; i++) {
        var c = "[Info] I am defined inside an for statement";
    }

    console.log(a,"\n",b,"\n",c);
}
sayHello();

try {
    // this will throw an error cause you you
    // trying to access a, b and c outside of it's functional scope.
    console.log(a, "\n", b, "\n", c);
} catch (err) {
    console.log('[Error] ' + err.message);
}
console.log('[Info] Global var a value > ', a);

