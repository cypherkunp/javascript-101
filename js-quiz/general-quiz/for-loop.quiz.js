// when index is a var
for (var index = 0; index < 2; index++) {
  setTimeout(() => {
    console.log(index); // 2, 2
  });
}

console.log(index);

// when index is a let
for (let i = 0; i < 2; i++) {
  setTimeout(() => {
    console.log(i); // 0, 1
  });
}
