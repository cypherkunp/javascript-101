//Standard try catch block
try {
  console.log(notDeclaredNumber);
} catch (err) {
  console.log(err.message);
}

// when you dont want to use the exception object
try {
  console.log(notDeclaredNumber);
} catch {
  console.log('Something went wrong...');
}
