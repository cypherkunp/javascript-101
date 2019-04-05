const x = 10;
const y = 5;
const z = 500;
let finalEval = null;

finalEval = x || y || z; // 10
console.log('x || y || z :', finalEval);

finalEval = x > y || z; // true
console.log('x > y || z : ', finalEval);

finalEval = null || z; //500
console.log('null || z : ', finalEval);

finalEval = undefined || z; // 500
console.log('undefined || z : ', finalEval);

finalEval = '' || z; // 500
console.log(`'' || z :`, finalEval);

finalEval = NaN || z; // 500
console.log(`NaN || z :`, finalEval);

finalEval = {} || z; // {}
console.log(`{} || z :`, finalEval);
