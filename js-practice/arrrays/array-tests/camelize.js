const array = ['start-with-ssh', 'text-wrap', '-value-display'];

function camelize(dashedString) {
  let charArray = dashedString
    .split('-')
    .map((word, index) => {
      return index === 0 ? word : word.split('')[0].toUpperCase() + word.slice(1);
    })
    .join('');

  return charArray;
}
const camelizedArray = array.map(dashedString => {
  return camelize(dashedString);
});
console.log('array: ', array);
console.log('camelizedArray: ', camelizedArray);
