function changeIt(value) {
    const typeOfValue = typeof value;
    switch (typeOfValue) {
        case 'number':
            console.log('Number passed...');
            value = 1;
            break;
        case 'string':
            console.log('String passed...');
            value = 'New String';
            break;
        case 'boolean':
            console.log('Boolean passed...');
            value = !value;
            break;
        case 'object':
            console.log('Object passed...');
            value = {
                new: 'New Value'
            };
            break;
    }
}

let numValue = 12;
changeIt(numValue);
console.log('before:', numValue, '| after:', numValue);

let strValue = 'Hello';
changeIt(strValue);
console.log('before:', strValue, '| after:', strValue);

let boolValue = true;
changeIt(boolValue);
console.log('before:', boolValue, '| after:', boolValue);

let objValue = {
    name: 'Value'
};
changeIt(objValue);
console.log('before:', objValue, '| after:', objValue);
