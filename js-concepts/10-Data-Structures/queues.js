/**
 * Queue is FIFO structure. Elements added first are removed first.
 * 
 * Operations supported by a queue:
 * 1. push
 * 2. pop
 * 3. clear
 * 4. length
 * 
 * Types of queue:
 * Enqueue and Dequeue
 * 
 */

function Queue() {
    this.items = new Array();
    this.length = 0;
}

Queue.prototype.push = function (data) {
    this.length += 1;
    this.items.push(data);
}

Queue.prototype.pop = function () {
    if (this.length > 0) {
        this.length -= 1;
        return this.items.shift();
    }
    return null;
}

Queue.prototype.peek = function () {
    return this.items[0];
}

Queue.prototype.iterator = function* () {
    let count = 0;
    while(count < this.length){
        yield this.items[count++];
    }
 }

var myQueue = new Queue();

myQueue.push("First");
myQueue.push("Second");
myQueue.push("Third");

console.log('Iterating over the queue: With Generators');
var myIterator = myQueue.iterator();

for (const item of myIterator) {
    console.log(` - ${item}`);
}

console.log(`First element in the queue > ${myQueue.peek()}`);
console.log(`Length of the queue > ${myQueue.length}`);
console.log();

// Removing from the queue
console.log(myQueue.pop());
console.log(myQueue);
console.log(`First element in the queue > ${myQueue.peek()}`);

console.log();
console.log(myQueue.pop());
console.log(myQueue);

console.log();
console.log(myQueue.pop());
console.log(myQueue);

console.log();
console.log(myQueue.pop());
console.log(myQueue);