function pow(x, n) {
  return n === 1 ? x : x * pow(x, n - 1);
}

const result1 = pow(2, 2);
const result2 = pow(2, 3);
