/**
 * Supported Operations on Arrays:
 * 1. push
 * 2. pop
 * 3. find
 * 4. slice
 * 5. splice
 * 6. map
 * 7. shift
 * 8. unshift
 * JavaScript 5 Array.prototype transformation methods
 *
 * In JS Arrays are implemented as objects and the contents of the arrays are not
 * placed next to each other in the memory like in other programming languages
 *
 * Features:
 * 1. Constant time access
 * 2. Allocated contiguous  memory
 * 3. element = array[elementSize * offset]

- An array is useful because it stores multiple values into a single, organized data structure. 
- You can define a new array by listing values separated with commas between square brackets[].
- Arrays have a set of special methods to help you iterate over and perform operations on collections of data.
- You can view the MDN Documentation list of Array methods here, but a couple big ones to know are the forEach()
 and map() methods.
 
- Array Properties
 constructor  -  Returns the function that created the Array object 's prototype
 length       -  Sets or returns the number of elements in an array
 prototype    -  Allows you to add properties and methods to an Array object
 */

/**
 Array Methods
 Method Description
 concat() Joins two or more arrays, and returns a copy of the joined arrays
 copyWithin() Copies array elements within the array, to and from specified positions
 entries() Returns a key / value pair Array Iteration Object
 every() Checks if every element in an array pass a test
 fill() Fill the elements in an array with a static value
 filter() Creates a new array with every element in an array that pass a test
 find() Returns the value of the first element in an array that pass a test
 findIndex() Returns the index of the first element in an array that pass a test
 forEach() Calls a function for each array element
 from() Creates an array from an object
 includes() Check if an array contains the specified element
 indexOf() Search the array for an element and returns its position
 isArray() Checks whether an object is an array
 join() Joins all elements of an array into a string
 keys() Returns a Array Iteration Object, containing the keys of the original array
 lastIndexOf() Search the array for an element, starting at the end, and returns its position
 map() Creates a new array with the result of calling a function for each array element
 pop() Removes the last element of an array, and returns that element
 push() Adds new elements to the end of an array, and returns the new length
 reduce() Reduce the values of an array to a single value(going left - to - right)
 reduceRight() Reduce the values of an array to a single value(going right - to - left)
 reverse() Reverses the order of the elements in an array
 shift() Removes the first element of an array, and returns that element
 slice() Selects a part of an array, and returns the new array
 some() Checks if any of the elements in an array pass a test
 sort() Sorts the elements of an array
 splice() Adds / Removes elements from an array
 toString() Converts an array to a string, and returns the result
 unshift() Adds new elements to the beginning of an array, and returns the new length
 valueOf() Returns the primitive value of an array
 */
var array = [1, 2, 3, 4];

console.log(`Array initialized > ${array}`);

array.push(5);
console.log(`Array after pushing 5 > ${array}`);

array.pop();
console.log(`Array after pop > ${array}`);

var iOf4 = array.indexOf(4);
console.log(`i of 4 in the array > ${iOf4}`);

// This will output -1 as we have popped out 5 from the array earlier
var iOf5 = array.indexOf(5);
console.log(`i of 5 in the array > ${iOf5}`);

// Using Array.map()
var nameList = ["Steve", "Bill", "Jack", "Elon"];
var nameListLowerCase = nameList.map(name => {
  return name.toLowerCase();
});
console.log("\n----Array.map()----");
console.log(`Name List original > ${nameList}`);
console.log(`Name List lower case > ${nameListLowerCase}`);

// Filtering in an array
var authors = [
  {
    name: "Jack",
    sections: ["technology", "sports"]
  },
  {
    name: "Steve",
    sections: ["sports", "business"]
  },
  {
    name: "bill",
    sections: ["finance", "business"]
  },
  {
    name: "Mark",
    sections: ["advertising", "business"]
  }
];

function whoWritesFor(section) {
  let sectionsArray = [];
  for (let i = 0; i < authors.length; i++) {
    if (authors[i].sections.indexOf(section) >= 0) {
      sectionsArray.push(authors[i].name);
    }
  }
  return sectionsArray;
}
// Using Array.filter()
function authorFilter(section) {
  return authors
    .filter(author => {
      return author.sections.indexOf(section) >= 0;
    })
    .map(author => {
      return author.name;
    });
}
console.log("\n----Filtering----");
console.log(authors);
console.log();
console.log(`Who writes for business > ${whoWritesFor("business")}`);
console.log(`Who writes for advertising > ${whoWritesFor("advertising")}`);
console.log(`Who writes for technology > ${authorFilter("technology")}`);

// Deleting an element in the array

function deleteAuthor(params) {
  let index = 0;
  authors.forEach(author => {
    if (author.name === params) {
      console.log(authors.splice(index, 1));
    }
    index++;
  });
}
console.log("After deleting...");
deleteAuthor("Jack");
console.log(authors);

// Arrays.map()
// map function was introduced in es6
// map returns a new array

var color = ["green", "yellow", "blue", "red"];

console.log("\nColors in the array are:");
color.map(color => {
  console.log(`- ${color.toUpperCase()}`);
});

// forEach
var donuts = ["jelly donut", "chocolate donut", "glazed donut"];

donuts.forEach(function(donut) {
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
words.forEach(function(word, num, all) {
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

var improvedDonuts = donuts.map(function(donut) {
  donut += " hole";
  donut = donut.toUpperCase();
  return donut;
});

var someArry = [];
someArry[10] = 1;
someArry[1] = 10;
console.log(someArry[0]);
console.log(someArry[1]);
someArry.forEach(function(value, index) {
  console.log(index + ":" + value);
});

// DETECTING AN ARRAY
console.log(`Is someArry an array? ${someArry instanceof Array}`);
var someVar = "";
console.log(`Is someVar an array? ${someVar instanceof Array}`);
