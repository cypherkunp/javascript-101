function solution(A) {
    const newA = [...A.sort((a, b) => a - b)].filter((a, index, array) => a > 0 && array.indexOf(a) === index);
    for (let i = 0; i <= newA.length; i++) {
        if (newA[i] !== i + 1) return i + 1;
    }
}

console.log(solution([1, 3, 6, 4, 1, 2]));
console.log(solution([-1, -2]));
console.log(solution([1, 2, 3]));
