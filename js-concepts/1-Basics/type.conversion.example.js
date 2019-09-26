var fontSizeInString = "16px";
var fontSize = parseInt(fontSizeInString.replace(/[^0-9]/g, ""));

console.log(fontSize);
console.log(typeof fontSizeInString);
console.log(typeof fontSize);

var widgetWidth = 4;
var widgetHeight = 5;
var fontSize = 2;

var cumulativeWidth = widgetWidth * (Math.floor(widgetHeight / fontSize));
console.log(cumulativeWidth);
