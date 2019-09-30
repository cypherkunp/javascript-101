const strArray = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

// loops through the elements of an array and returns nothing
strArray.forEach((item, index, array) => {
    console.log(`${item} is at index ${index} in ${array}`);
    console.log();
});

// printing the elements in uppercase
const returnFromForEach = strArray.forEach((day, index) => {
    console.log(index + ': ', day.toUpperCase());
});
console.log('forEach return: ', returnFromForEach);
