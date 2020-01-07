const sym = Symbol('id');

const multiObject = {
    bol: true,
    num: 23.2,
    str: 'Hello',
    [sym]: 'Hello',
    fun() {
        return 'Hello Function';
    }
};

const objectPropDes = Object.getOwnPropertyDescriptor(multiObject, 'bol');
const objectProNames = Object.getOwnPropertyNames(multiObject);
const objectPropSymbols = Object.getOwnPropertySymbols(multiObject);

console.log(objectPropDes);
console.log(objectProNames);
console.log(objectPropSymbols);
