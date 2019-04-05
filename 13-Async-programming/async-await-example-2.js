console.log('Before');
console.log(getUser()); // this will return defined
console.log('After');

function getUser() {
  setTimeout(() => {
    return 'Reading the user for the database...';
  }, 2000);
}
