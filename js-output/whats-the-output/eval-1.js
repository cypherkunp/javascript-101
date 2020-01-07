let sum = eval('10*10+5');
console.log(sum); // 105
sum = eval('10*10+"5"');
console.log(sum); //1005
sum = eval('21+sum');
console.log(sum); //211005
