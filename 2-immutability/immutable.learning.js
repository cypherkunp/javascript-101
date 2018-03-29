let movie1 = { name: 'Start Wars', episode: 7 };
let movie2 = movie1;

movie2.episode = 8;
// movie1 gets modified
console.log(movie1.episode, movie2.episode);

// Immutable pattern  with ES6 (shalow copy)
let movie3 = { name: 'Armagaddon', episode: 2,obj: { k :'value'} };
let movie4 = Object.assign({}, movie3);
movie4.episode = 5;
movie4.obj.k = 'value1';
console.log(JSON.stringify(movie3));

console.log(JSON.stringify(movie4));
console.log(movie3.episode, movie4.episode);

