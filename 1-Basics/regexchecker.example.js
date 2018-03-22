var fileName = 'He.';
// var dotRegExPattern = '/^([.])/g';
// var specialCharRegExPattern = '([/?<>\\:*|\"^%$;+{}=,&@#!()\'~])';
var dotRegEx =/^([.])/g;
var specialCharRegEx = /([\[\]/?<>\\:*|\"\^%$;+{}=,&@#!()\'\\~])/g;
var res = dotRegEx.test(fileName); 
console.log("Doest start with dot? " + res);
var res  = specialCharRegEx.test(fileName);
console.log("Doest has special chars? " + res);
