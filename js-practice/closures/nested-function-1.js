function sayHi(firstName, surname) {
    function getName() {
        // nested function
        return firstName + ' ' + surname;
    }

    console.log(`Hi, ${getName()}`);
}

sayHi('Steve', 'Jobs');
