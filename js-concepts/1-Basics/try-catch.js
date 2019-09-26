//Standard try catch block
try {
  console.log(notDeclaredNumber);
} catch (err) {
  console.log(err.message);
}
console.log();

// when you dont want to use the exception object
try {
  console.log(notDeclaredNumber);
} catch {
  console.log('Something went wrong...');
}
console.log();

// finally
try {
  console.log(notDeclaredNumber);
} catch {
  console.log('caught something...');
} finally {
  console.log('finally something...');
}
