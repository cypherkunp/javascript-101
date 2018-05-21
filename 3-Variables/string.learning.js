const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

for (const iterator in days) {
    day = days[iterator];
    console.log(day.charAt(0).toUpperCase() + day.slice(1));
}