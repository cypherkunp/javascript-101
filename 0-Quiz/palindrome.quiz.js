/**
 * Programming Quiz: Write a function that return true/false if a string or a number is palindrome or not
 * @author devvratio.github.com
 */
function reverseString(stringToReverse) {
    let reverseString = "";
    for (let i = stringToReverse.length - 1; i >= 0; i--) {
        reverseString += stringToReverse[i];
    }
    console.log(reverseString);
    return reverseString;
}

function isPalindrome(inputString) {
    var reverseString1 = reverseString(inputString);
    if (reverseString1 === inputString) {
        console.log(true);
        return true;
    }
    console.log(false);
    return false;
}

// Calling the functions

reverseString("Devvrat");
isPalindrome("121");