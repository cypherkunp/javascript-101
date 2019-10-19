function dateToBase(date, month, year, base, separator) {
  separator = separator ? separator : '/';
  return `${date.toString(base)}${separator}${month.toString(base)}${separator}${year.toString(
    base
  )}`;
}

console.log(dateToBase(31, 12, 2000, 2));
console.log(dateToBase(31, 12, 2000, 10));
console.log(dateToBase(31, 12, 2000, 16));

// calling toString() on numbers directly
console.log(typeof (12345).valueOf());
console.log(dateToBase(31, 12, 2000, 16));
