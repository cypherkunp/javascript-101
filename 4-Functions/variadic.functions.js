/*
 Variadic functions are functions that take an indefinite number of arguments.
*/

// Variadic function can be easily implemented using ...rest parameter
function sum(...nums){
    let total = 0;
    for (const num of nums) {
        total += num;
    }
    return total;
}

console.log(sum(1, 2));
console.log(sum(10, 36, 7, 84, 90, 110));
console.log(sum(-23, 3000, 575000));

// Another example, calculating average of numbers

function average(...numbers) {
    let count = 0, total = 0;
    for (const number of numbers) {
        total += number;
        count++;
    }
    count = count || 1;
    return total/count;
}

console.log(average(2, 6));
console.log(average(2, 3, 3, 5, 7, 10));
console.log(average(7, 1432, 12, 13, 100));
console.log(average());
