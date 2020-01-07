const userObj = {
    name: 'DEvvrat'
};

const userFunc = function(msg) {
    let message = msg;
    console.log(msg);
};

const userArr = ['Devvrat', 'Shukla'];

console.log('----TYPE OF-----');
console.log(typeof userObj); // object
console.log(typeof userFunc); // function
console.log(typeof userArr); // object

console.log();
console.log(Object.getOwnPropertyDescriptor(userObj, 'name'));
console.log(Object.getOwnPropertyDescriptor(userArr, '0'));
console.log();
console.log(userObj);
console.log(userFunc);
console.log(userArr);
