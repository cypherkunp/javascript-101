const person = (function() {
    let age = 25;
    return {
        name: 'Devvrat',
        getAge() {
            return age;
        },
        growOlder() {
            age++;
        }
    };
})();

console.log(person.getAge());
console.log(person.name);

person.growOlder();
console.log(person.getAge());

person.age = 100;
console.log(person.getAge());
