function validateBrackets(str) {
    const stack = [];
    for (const char of str) {
        if (char === '(') stack.push(char);
        else if (char === ')') {
            if (!stack.pop()) return false;
        }
    }
    return !stack.length;
}

console.log(validateBrackets('(((a+b)))'));
