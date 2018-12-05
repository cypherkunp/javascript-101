const numbers = {
    a: 1
}

function addAll(b, c, d) {
    console.log(this.a + b + c + d);
}

var bcdArray = [2, 3, 4];

addAll.apply(numbers, bcdArray); // logs 10