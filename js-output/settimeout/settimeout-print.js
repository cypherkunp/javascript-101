for (var i = 0; i < 5; i++) {
    setTimeout(() => {
        console.log(i); // 5 5 5 5 5
    }, 0);
}
console.log('value of i', i); //5

//Solution to above problem

for (var index = 0; index < 5; index++) {
    (index => {
        setTimeout(() => {
            console.log(index);
        }, 0);
    })();
}
console.log('value of index', index);
