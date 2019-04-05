console.log('Before');
console.log(getUser()); // this will return defined
console.log('After');

function getUser(id) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      console.log('Reading the use from the database...');
    }, timeout);
  });
}
