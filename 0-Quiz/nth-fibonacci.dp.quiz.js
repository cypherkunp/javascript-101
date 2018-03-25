/**
 * Programming Quiz: Find the nth fibonacci number using the dynamic programming techniques.
 * @author devvratio.github.com
 */
var startTimeInMS = 0;
var stopTimeInMS = 0;
var nthFibValue = 10;

// UN-OPTIMIZED RECURSION APPROACH
function getNthFibonacciUOP(n) {
    var f = 0;
    if (n <= 2) {
        return 1;
    } else {
        return getNthFibonacciUOP(n - 1) + getNthFibonacciUOP(n - 2);
    }
}
startTimeInMS = getTimeStamp();
console.log(getNthFibonacciUOP(nthFibValue));
stopTimeInMS = getTimeStamp();
console.log('Time taken to get the nth fibonacci using recursion is > ' + timeDiff(startTimeInMS, stopTimeInMS));

// MEMOIZATION APPROACH
var mem = [1,1];
function getNthFibonacciMEM(n) {
    var fib = 0;
    if (mem[n-1] || n<=2) {
        return mem[n-1];
    } else {
        fib = getNthFibonacciMEM(n - 1) + getNthFibonacciMEM(n - 2);
        mem[n-1] = fib;
        return fib;
    }
}
startTimeInMS = getTimeStamp();
console.log(getNthFibonacciMEM(nthFibValue));
stopTimeInMS = getTimeStamp();
console.log('Time taken to get the nth fibonacci using memoization approach is > ' + timeDiff(startTimeInMS, stopTimeInMS));

// BOTTOM - UP APPROACH
var fibArray = [];
function getNthFibonacciBUP(n) {
    for (let i = 0; i < n; i++) {
        if (i <= 1) {
            fibArray[i] = 1;
        } else {
            fibArray[i] = fibArray[i - 1] + fibArray[i - 2];
        }
    }
    return fibArray[n - 1];
}
startTimeInMS = getTimeStamp();
console.log(getNthFibonacciBUP(nthFibValue));
stopTimeInMS = getTimeStamp();
console.log('Time taken to get the nth fibonacci using bottom up approach is > ' + timeDiff(startTimeInMS, stopTimeInMS));


// HELPER METHODS
function timeDiff(startTime, stopTime) {
    return stopTime - startTime;
}

function getTimeStamp() {
    let dateNow = new Date();
    let timeHoursInMS = dateNow.getHours() * 60 * 60 * 1000;
    let timeMinutesInMS = dateNow.getMinutes() * 60 * 1000;
    let timeSecondInMS = dateNow.getSeconds() * 1000;
    return timeHoursInMS + timeMinutesInMS + timeSecondInMS + dateNow.getMilliseconds();
}