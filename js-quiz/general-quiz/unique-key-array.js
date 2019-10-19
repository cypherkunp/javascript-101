let fields = 'Document,ID,State,ID,State,Document,Section';
let fieldArray = fields.split(',');
fieldArray = fieldArray.filter((currentValue, index, arr) => arr.indexOf(currentValue) === index);
fields = fieldArray.join(',');

console.log('Approach 1', fields);

fields = 'Document,ID,State,ID,State,Document,Section';
fieldArray = fields.split(',');
fieldArray = [...new Set(fieldArray)];
fields = fieldArray.join(',');

console.log('Approach 2', fields);
