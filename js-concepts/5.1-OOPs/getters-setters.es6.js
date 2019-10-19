const person = {
    firstName: 'Devvrat',
    lastName: 'Shukla',
    get fullName() {
        return `${this.firstName} ${this.lastName}`;
    },
    set fullName(name) {
        if (name.includes(' ')) {
            var nameArr = name.split(' ');
            this.firstName = nameArr[0];
            this.lastName = nameArr[1];
        } else {
            this.firstName = name;
            this.lastName = '';
        }
    }
}

// Getters > to access the property in an object. It's like accessing a property.
console.log('Fullname is >', person.fullName);
// Setters > to change or mutate the properties of an object.
person.fullName = 'Elon Musk';
console.log('Updated Fullname is >', person.fullName);
person.fullName = 'Steve';
console.log('Updated Fullname is >', person.fullName);

