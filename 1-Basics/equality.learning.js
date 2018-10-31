/**
 * EQUALITY
 There are four equality operators: == , === , != , and !== .The!forms are of course the symmetric“ not equal”
  versions of their counterparts;
 non - equality should not be confused with inequality.

 The difference between == and === is usually characterized that == checks
 for value equality and === checks
 for both value and type equality.However, this is inaccurate.The proper way to characterize them is that 
 == checks
 for value equality with coercion allowed, and === checks
 for value equality without allowing coercion; === is often called“ strict equality”
 for this reason.

 Consider the implicit coercion that’ s allowed by the == loose - equality comparison and not allowed with 
 the === strict - equality:
 */
var a = "42";
var b = 42;

a == b; // true
a === b; // false

/**
 * You should take special note of the == and === comparison rules
 if you’ re comparing two non - primitive values, like objects(including
     function and array).Because those values are actually held by reference, both == and === comparisons
      will simply check whether the references match, not anything about the underlying values.

 For example, arrays are by
 default coerced to strings by simply joining all the values with commas(, ) in between.You might think that two arrays with the same contents would be == equal, but they’ re not:
 */

 var a = [1, 2, 3];
 var b = [1, 2, 3];
 var c = "1,2,3";

 a == c; // true
 b == c; // true
 a == b; // false

 //
 var a = 41;
 var b = "42";
 var c = "43";

 a < b; // true
 b < c; // true