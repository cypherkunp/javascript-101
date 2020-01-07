const user = {
    name: 'Devvrat',
    contact: 3322323,
    location: 'Mumbai',
    sing() {
        return 'lalalala';
    },
    length: null
};

user.length = Object.keys(user).length;
console.log(user.length);
