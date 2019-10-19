let user = {
  sayHi() {
    // ignored
    alert('Hello');
  },
  [Symbol('id')]: 123, // ignored
  something: undefined // ignored
};

console.log(JSON.stringify(user)); // {} (empty object)

let meetup = {
  title: 'Conference',
  room: {
    number: 23,
    participants: ['john', 'ann']
  }
};

console.log(JSON.stringify(meetup));
/* The whole structure is stringified:
{
  "title":"Conference",
  "room":{"number":23,"participants":["john","ann"]},
}
*/

// circular dependenies not allowed
let room = {
  number: 23
};

/* 
meetup.place = room; // meetup references room
room.occupiedBy = meetup; // room references meetup

JSON.stringify(meetup); // Error: Converting circular structure to JSON
 */
