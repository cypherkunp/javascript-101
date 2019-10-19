function makeCount() {
    function count() {
        return count.counter;
    }

    count.counter = 0;
    count.set = function(value) {
        count.counter = value;
    };
    count.decrease = function() {
        count.counter--;
    };
    count.increase = function() {
        count.counter++;
    };
    return count;
}

const count = makeCount();

console.log(count()); //0

count.set(10);
console.log(count()); //10

count.decrease(); // ->9
console.log(count()); // 9

count.increase();
console.log(count()); //10
