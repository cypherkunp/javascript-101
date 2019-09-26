class AppError extends Error {
  constructor(errorType, errorCode, errorDescription, isOperational) {
    super();
    this.errorType = errorType;
    this.errorCode = errorCode;
    this.errorDescription = errorDescription;
    this.isOperational = isOperational;
  }
}

try {
  throw new AppError('Not Found', 404, 'Resource is not located under posts', true);
} catch (error) {
  console.log(error);
}
