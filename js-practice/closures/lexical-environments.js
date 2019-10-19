let phrase = 'Hello'; // outer lexical environment

function say(name) {
    let phrase = 'hi'; // inner lexical environment
    console.log(`${phrase}, ${name}`);
}

say('Devvrat');
