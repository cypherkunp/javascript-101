class AppError extends Error {
    constructor(...params) {
        super(...params);
        this.timestamp = Date.now();
        this.name = 'AppError';
    }
}

function processError(error) {
    if (error instanceof AppError) {
        console.log(`${error.timestamp} | ${error.name} | ${error.message}`);
    } else {
        console.log(`${error.name} | ${error.message}`);
    }
}

try {
    throw new AppError('Some app specific error');
} catch (error) {
    processError(error);
}

try {
    throw Error('This is a generic error');
} catch (error) {
    processError(error);
}
