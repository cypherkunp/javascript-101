/*
 if...else statement
*/
var condition1 = true;
var condition2 = false;

if (condition1){
    console.log('I am true!');
} else if (condition2) {
    console.log('I am also true!');
} else {
    console.log('I am false!');
}

/*
Switch statement:
*/
var day = '';
var dayOfTheWeek = new Date().getDay();
switch (dayOfTheWeek) {
    case 0:
        day = "Sunday";
        break;
    case 1:
        day = "Monday";
        break;
    case 2:
        day = "Tuesday";
        break;
    case 3:
        day = "Wednesday";
    case 4:
        day = "Thursday";
        break;
    case 5:
        day = "Friday";
        break;
    case 6:
        day = "Saturday";
    default:
        day += ", but a good day!";
}
console.log(day);

/*
Ternary operator
*/
var isGoing = true;
var color = isGoing ? "green" : "red";
console.log(color);