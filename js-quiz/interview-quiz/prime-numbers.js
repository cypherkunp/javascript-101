const isPrime = num => {
    for (let index = 2; index <= num / 2; index++) {
        if (num % index === 0) return false;
    }
    return num > 1;
};

const primeArray = [1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 13, 14, 15, 16, 17, 19];

primeArray.forEach(num => console.log(num, isPrime(num)));
