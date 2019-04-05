// Pre resolved promises, usually required at the time of testing
const pres = Promise.resolve(['Devvrat', 'Elon', 'Steve']);
pres.then(result => console.log(result));

const prej = Promise.reject(new Error('Reason for rejection...'));
prej.catch(err => console.log('Error Message: ', err.message));
// for call stack
prej.catch(err => console.log(err));
