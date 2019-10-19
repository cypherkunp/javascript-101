var someArray = [];
someArray[10] = 'whatever';
console.log(someArray.length); // "11"

someArray[-1] = 'A property';
someArray[3.1415] = 'Vaguely Pi';
someArray['test'] = 'Whatever';

console.log(someArray.length); // "11"
console.log(someArray['test']); // Whatever
console.log(someArray[3.1415]); // Vaguely Pi
console.log(someArray[-1]); // A property
