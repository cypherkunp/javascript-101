
// This is how we define a definition or a statement
function fooDefinition(){
    console.log("Hello World - fooDefinition");
}
    
// I am an expression. I resolve to a value even if it is undefined.
 var fooExpression = function () {
console.log("Hello World - fooExpression");
}
// I am an IIFE > Immediately Invoked Function Expression

(function() {
     console.log("Hello World - iife1");
 }());

(function () {
    console.log("Hello World - iife2");
}());


(function () {
    console.log("Hello World - iife3");
}());
