const user = {
  name: 'Devvrat',
  age: 32,
  location: 'India'
};

user.id = 1234;
// adding a symbol literal
// Symbols allow us to create “hidden” properties of an object, that no other part of code can occasionally access or overwrite.

const id = Symbol('id');
const uid = Symbol('id');
user[id] = 5678;
user[uid] = 91011;

// symbol is ignored by for..in
for (const key in user) {
  if (user.hasOwnProperty(key)) {
    const element = user[key];
    console.log('Key: ', key, ' | ', 'Value: ', element);
  }
}

// Object.keys also ignores symbol literals

console.log('User object keys: ', Object.keys(user));

// printing the symbol key value
console.log(user[id]);
// another symbol property
console.log(user[uid]);

// accessing object symbol literals
console.log('User object symbol literals: ', Object.getOwnPropertySymbols(user));

// value of the id key
console.log(user['id']);

/*
What’s the benefit of using Symbol("id") over a string "id"?

As user objects belongs to another code, and that code also works with them, we shouldn’t just add any fields to it. That’s unsafe. But a symbol cannot be accessed occasionally, the third-party code probably won’t even see it, so it’s probably all right to do.

Also, imagine that another script wants to have its own identifier inside user, for its own purposes. That may be another JavaScript library, so that the scripts are completely unaware of each other.

Then that script can create its own Symbol("id"), like this:
*/
