function isValidObject(obj) {
    return obj && Object.keys(obj).length ? true : false;
}

const testArray = [null, undefined, {}, { name: 'Devvrat' }, [], function say() {}, new Date()];

for (const value of testArray) {
    console.log(`Value: ${value} | type of value: ${typeof value} | is valid object: ${isValidObject(value)}`);
}
