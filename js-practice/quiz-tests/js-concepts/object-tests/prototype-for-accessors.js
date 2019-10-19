const user = {
    name: 'Devvrat',
    surname: 'Shukla',

    set fullName(value) {
        [this.name, this.surname] = value.split(' ');
    },

    get fullName() {
        return `${this.name} ${this.surname}`;
    }
};

const admin = {
    __proto__: user,
    isAdmin: true
};

console.log(admin.fullName);
admin.fullName = 'Steve Jobs';
console.log(admin.fullName);
console.log(admin);

for (const key in admin) {
    if (admin.hasOwnProperty(key)) {
        console.log('Own property: ', key, ': ', admin[key]);
    } else {
        console.log('Inherited property: ', key, ' : ', admin[key]);
    }
}
