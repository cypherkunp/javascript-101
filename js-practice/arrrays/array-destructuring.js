const arr = ['id', 'name', 'phone', 'email'];
let id,
    restarr = null;

[id, ...restarr] = arr;

console.log(id);
console.log(restarr);
