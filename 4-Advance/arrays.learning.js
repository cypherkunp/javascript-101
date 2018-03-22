/*
Arrays:
- An array is useful because it stores multiple values into a single, organized data structure.
- 0 You can define a new array by listing values separated with commas between square brackets [].
*/

/*

Arrays have a set of special methods to help you iterate over and perform operations on collections of data.
You can view the MDN Documentation list of Array methods here, but a couple big ones to know are the forEach() 
and map() methods.
*/

var donuts = ["jelly donut", "chocolate donut", "glazed donut"];

donuts.forEach(function (donut) {
    donut += " hole";
    donut = donut.toUpperCase();
    console.log(donut);
});

/*
Parameters:
- The function that you pass to the forEach() method can take up to three parameters, 
you can call them whatever you like but let's use the names element, index and array for e.g..
- The forEach() method will call this function once for each element in the array (hence the name forEach.) 
- Each time, it will call the function with different arguments. 
- The element parameter will get the value of the array element. 
- The index parameter will get the index of the element (starting with zero). 
- The array parameter will get a reference to the whole array, which is handy if you want to modify the elements.
*/

words = ["cat", "in", "hat"];
words.forEach(function (word, num, all) {
    console.log("Word " + num + " in " + all.toString() + " is " + word);
});

/*
MAP:

- Using forEach() will not be useful if you want to permanently modify the original array.
- forEach() always returns undefined.
- However, creating a new array from an existing array is simple with the powerful map() method.
- With the map() method, you can take an array, perform some operation on each element of the array, 
and return a new array.
- The map() method accepts one argument, a function that will be used to manipulate each element in the array.
*/

var improvedDonuts = donuts.map(function (donut) {
    donut += " hole";
    donut = donut.toUpperCase();
    return donut;
});