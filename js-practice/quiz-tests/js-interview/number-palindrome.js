const reverse = str =>
    ('' + str)
        .split('')
        .reverse()
        .join('');

console.log(reverse(1012));
console.log(reverse(null));
console.log(reverse('sfdsdfsd'));
