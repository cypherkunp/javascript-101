let calculator = {
  a: null,
  b: null,
  read() {
    a = 1;
    b = 2;
  },
  sum() {
    return a + b;
  },
  mul() {
    return a * b;
  }
};
calculator.read();
console.log(calculator.sum());
console.log(calculator.mul());
