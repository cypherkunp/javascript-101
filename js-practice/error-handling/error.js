function greet(message) {
    if (message) {
        console.log(message);
    } else {
        throw new Error('Please enter a valid message.');
    }
}

try {
    greet();
} catch (error) {
    console.log(error);
}
