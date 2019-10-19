function compare(newValue, oldValue) {
  if (newValue === oldValue) return true;
  else return false;
}

const newValue = {
  name: 'Devvrat',
  active: true
};

const oldValue = {
  name: 'Devvrat',
  active: true
};

console.log(`newValue: ${newValue.name}`);
console.log(`oldValue: ${oldValue.name}`);

console.log('compare: ', compare(newValue, oldValue));
