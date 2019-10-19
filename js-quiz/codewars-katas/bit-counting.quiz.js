/**
 * Write a function that takes an integer as input, and returns the number of bits that are equal
 *  to one in the binary representation of that number. You can guarantee that input is non - negative.
 *
 * Example: The binary representation of 1234 is 10011010010, so the function should return 5 in this case
 */

function toBinary(baseTenRep) {
  if (baseTenRep >= 0) {
    let binaryRep = [];
    let index = 0;
    while (baseTenRep > 0) {
      binaryRep[index] = baseTenRep % 2;
      baseTenRep = parseInt(baseTenRep / 2);
      index++;
    }
    return parseInt(binaryRep.reverse().join(''));
  } else {
    throw 'Non-negative numbers only!';
  }
}

function countBits(baseTenRep) {
  let baseTwoRep = toBinary(baseTenRep).toString();
  let countOfOnes = 0;
  for (let i = 0; i < baseTwoRep.length; i++) {
    if (baseTwoRep.charAt(i) == 1) {
      countOfOnes++;
    }
  }
  return countOfOnes;
}

console.log(countBits(1234));
