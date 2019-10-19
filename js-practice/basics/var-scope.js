var name = 'Jhon';

function say1() {
    console.log('say1-in-1:', name);
    var name = 'Dev';
    console.log('say1-in-2:', name);
}

function say2() {
    console.log('say2-in-1:', name);
    var age = 22;
    console.log('say2-in-2:', name);
    console.log('say2-in-3', age);
    {
        var name = 'steve';
        console.log('say2-in-4', name);
    }
}

console.log('out-1:', name);
say1();
console.log('out-2:', name);
say2();
