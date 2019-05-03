const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

for (const iterator in days) {
  day = days[iterator];
  console.log(day.charAt(0).toUpperCase() + day.slice(1));
}

// trimStart(), trimEnd(), trim() methods
const someString = '       _Hello_         ';
console.log();
console.log('string    |', someString, '|');
console.log('trimStart |', someString.trimStart(), '|');
console.log('trimEnd   |', someString.trimEnd(), '|');
console.log('trim      |', someString.trim(), '|');
