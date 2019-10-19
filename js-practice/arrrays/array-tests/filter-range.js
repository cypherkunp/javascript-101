const arr = [5, 3, 8, 1, 2];

function filterRange(array, start, end) {
  return array.filter(item => item >= start && item <= end);
}

console.log('Range 1 to 3', filterRange(arr, 1, 3));
console.log('Range 1 to 5', filterRange(arr, 1, 5));
