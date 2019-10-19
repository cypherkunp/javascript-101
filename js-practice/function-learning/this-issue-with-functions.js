const user = {
    name: 'Devvrat',
    getName: function() {
        return function() {
            name;
        };
    },
    getDetails: function() {
        return () => this.name;
    }
};

const name = 'Jhon';
const gName = user.getName();
const details = user.getDetails();

console.log(gName());
console.log(details());
