var person = 'Mike';
var age = 28;

function myTag(strings, personExp, ageExp) {
    var str0 = strings[0]; // "That "
    var str1 = strings[1]; // " is a "

    // There is technically a string after
    // the final expression (in our example),
    // but it is empty (""), so disregard.
    // var str2 = strings[2];

    var ageStr;
    if (ageExp > 99) {
        ageStr = 'centenarian';
    } else {
        ageStr = 'youngster';
    }

    // We can even return a string built using a template literal
    return `${str0}${personExp}${str1}${ageStr}`;
}

var output = myTag`That ${person} is a ${age}`;

console.log(output);
// That Mike is a youngster

function printIt() {
    console.log('Total arguments passed > ', arguments.length);

    for (const argument of arguments) {
        console.log(argument);
    }
}

printIt`<h1>Hello Devvrat, How are you?</h1>`;
printIt`Hello ${'Devvrat'}, How are you?`;

console.log();
function greet() {
    console.log('Total arguments passed > ', arguments.length);

    const name = arguments[1];
    const age = arguments[2];
    let message = age > 18 ? 'You are eligible to vote!' : 'You are not eligible to vote';

    console.log(`Hello ${name}, ${message}`);
}

greet`${'Devvrat'} ${30}`;
greet`${'Devvrat'} ${17}`;
