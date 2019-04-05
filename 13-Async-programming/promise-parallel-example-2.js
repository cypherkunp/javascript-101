const p1 = new Promise((resolve, reject) => {
  setTimeout(() => {
    console.log('Async operation 1...');
    reject(new Error('Promise rejected cause of an error.'));
  }, 2000);
});

const p2 = new Promise(resolve => {
  setTimeout(() => {
    console.log('Async operation 2...');
    resolve(2);
  }, 2000);
});

// If one of the promise is rejected then final promise return from Promise.all
// is considered rejected
Promise.all([p1, p2])
  .then(result => console.log(result))
  .catch(error => console.log(error.message));
