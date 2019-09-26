const { httpStatusCodes } = require('./constants');

// httpStatusCodes is deep freezed
console.log('Before:', httpStatusCodes.client.BAD_REQUEST);
httpStatusCodes.client.BAD_REQUEST = 500;
console.log('After:', httpStatusCodes.client.BAD_REQUEST);
