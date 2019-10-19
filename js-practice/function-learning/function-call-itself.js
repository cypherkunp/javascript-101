function say(message) {
    message ? console.log(message) : say('hello');
}

say();
