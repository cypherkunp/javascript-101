function user(name, contact, location) {
    user.length = arguments.length;
    return arguments;
}

console.log(user.length);
