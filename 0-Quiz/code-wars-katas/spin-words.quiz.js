/**
 * Write a function that takes in a string of one or more words, 
 * and returns the same string, but with all five or more letter words reversed 
 * (Just like the name of this Kata). Strings passed in will consist of only letters and spaces. 
 * Spaces will be included only when more than one word is present.
 * 
 * Examples:
 * spinWords( "Hey fellow warriors" ) => returns "Hey wollef sroirraw"
 * spinWords( "This is a test") => returns "This is a test"
 * spinWords( "This is another test" )=> returns "This is rehtona test"
 */

function spinWords1(str) {
    let sentence = str.split(' ');
    let revSentence = '';

    sentence.forEach(function (word) {
        let revWord = '';
        let len = word.length;
        if (len > 4) {
            for (let i = (word.length - 1); i >= 0; i--) {
                revWord += word[i];
            }
            revSentence += revWord + ' ';
        } else {
            revSentence += word + ' ';
        }
    });
    return revSentence;
}

function spinWords2(str) {
    let revSentence = '';
    str.split(' ').forEach(function (str) {
        if (str.length > 4) {
            revSentence += str.split('').reverse().join('') + ' ';
        } else {
            revSentence += str + ' ';
        }
    });
    return revSentence.trim();
}

console.log('----IMPLEMENTATION 1----')
console.log(spinWords1("Hey fellow warriors"));
console.log(spinWords1("This is a test"));
console.log(spinWords1("This is another test"));
console.log();

console.log('----IMPLEMENTATION 2----')
console.log(spinWords2("Hey fellow warriors"));
console.log(spinWords2("This is a test"));
console.log(spinWords2("This is another test"));