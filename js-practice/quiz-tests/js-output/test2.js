let user = {
  name: 'John',
  go: () => {
    console.log(user.name); // no use of this in arrow functions
  }
};
user.go();
