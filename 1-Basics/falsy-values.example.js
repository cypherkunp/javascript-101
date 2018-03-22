//check for all falsy values such as: undefined, null, '', 0, false:
if (someVariable){
   // When someVariable is defined
} else {
    var someVariable = "Now I am defined";
}
console.log(someVariable);

var someVariable = null;
if (someVariable){
   // when someVariable is not null
} else {
 someVariable = "Now am not null";
}
console.log(someVariable);

var someVariable = '';
if (someVariable){
   // when someVariable is not blank
} else {
 someVariable = "Now am not blank";
}
console.log(someVariable);

var someVariable = 0;
if (someVariable){
   // when someVariable is not null
} else {
 someVariable = "Now am not zero";
}
console.log(someVariable);

var someVariable = false;
if (someVariable){
   // when someVariable is not null
} else {
 someVariable = "Now am not false";
}
console.log(someVariable);