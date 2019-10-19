/*
Find the largest palindrome in a string and print YES if its length is a prime no else print NO
*/

const isPrime = num => {
    for (let index = 2; index <= num / 2; index++) {
        if (!num % index) return false;
    }
    return num > 1;
};

const isPalindrome = str => str === [...str].reverse().join('');

function solution(str) {
    let largestPalindrome = '';
    const strLength = str.length;

    for (let i = 0; i < strLength - 2; i++) {
        const subString = str.substr(i, strLength);
        for (let j = 2; j < subString.length; j++) {
            const subOfSubString = subString.substr(0, j);
            if (isPalindrome(subOfSubString)) {
                largestPalindrome =
                    subOfSubString.length > largestPalindrome.length ? subOfSubString : largestPalindrome;
            }
        }
    }

    return isPrime(largestPalindrome.length) ? 'YES' : 'NO';
}

console.log(solution('hellolleh'));
