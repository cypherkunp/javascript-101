/**
 *   Return the second largest number in the array.
 *   @param {Number[]} nums - An array of numbers.
 *   @return {Number} The second largest number in the array.
 **/
function getSecondLargestA(nums) {
  nums = nums.filter((currentValue, index, arr) => {
    if (arr.indexOf(currentValue) === index) return currentValue;
  });

  nums = nums.sort((a, b) => b - a);
  if (nums.length > 1) return nums[1];
  else return null;
}

function getSecondLargestB(nums = []) {
  let largest = nums[0];
  nums = nums.filter((currentValue, index, arr) => {
    if (arr.indexOf(currentValue) === index) {
      if (currentValue > largest) {
        largest = currentValue;
      }
      return currentValue;
    }
  });
  let largestIndex = nums.indexOf(largest);
  largest = 0;
  nums.forEach((currentValue, index) => {
    if (index != largestIndex && currentValue > largest) largest = currentValue;
  });
  return largest;
}

function getSecondLargestC(nums = []) {
  let a = 0,
    b = 0;

  for (let index = 0; index < nums.length; index++) {
    const c = nums[index];
    if (c > a) {
      b = a;
      a = c;
      continue;
    }
    if (c < a && c > b) {
      b = c;
    }
  }
  return b;
}

function getSecondLargestD(nums = []) {
  let a = 0,
    b = 0;

  nums.forEach(c => {
    if (c > a) {
      b = a;
      a = c;
    } else if (c < a && c > b) {
      b = c;
    }
  });
  return b;
}

const dataSet1 = [10, 2, 3, 6, 6, 5, 5, 1, 9, 80, 335, 2, 14];
const dataSet2 = [9, 2, 1, 6, 5, 7];
const dataSet3 = [2, 1, 5, 4, 9];
const dataSet4 = [1, 2, 3, 4, 5, 6, 7, 8, 9];
const dataSet5 = [8, 7, 6, 4, 3, 2, 1];
const dataSet = dataSet2;
console.time('getSecondLargestA');
console.log(getSecondLargestA(dataSet));
console.timeEnd('getSecondLargestA');

console.time('getSecondLargestB');
console.log(getSecondLargestB(dataSet));
console.timeEnd('getSecondLargestB');

console.time('getSecondLargestC');
console.log(getSecondLargestC(dataSet));
console.timeEnd('getSecondLargestC');

console.time('getSecondLargestD');
console.log(getSecondLargestD(dataSet));
console.timeEnd('getSecondLargestD');
