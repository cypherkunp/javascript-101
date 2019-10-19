const person = (function() {
    let age = 25;
    function getAge() {
        return age;
    }
    function growOlder() {
        age++;
    }
    return {
        name: 'Devvrat',
        getAge: getAge,
        growOlder: growOlder
    };
})();

console.log(person.getAge());
console.log(person.name);

person.growOlder();
console.log(person.getAge());

person.age = 100;
console.log(person.getAge());
