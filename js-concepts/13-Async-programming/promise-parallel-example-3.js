const p1 = new Promise(resolve => {
  setTimeout(() => {
    console.log('Async operation 1...');
    resolve(1);
  }, 3000);
});

const p2 = new Promise(resolve => {
  setTimeout(() => {
    console.log('Async operation 2...');
    resolve(2);
  }, 2000);
});

// final promise is returned once any of the promises is fulfilled.
Promise.race([p1, p2]).then(result => console.log(result));
