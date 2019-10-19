Array.prototype.myMap = function(func) {
    const newArray = [];
    for (const e of this) {
        newArray.push(func(e));
    }

    return newArray;
};

function raisedTo2(e) {
    return e ** 2;
}

const testArr = [1, 2, 3, 4];
const mapArr = testArr.myMap(raisedTo2);
console.log(mapArr);
