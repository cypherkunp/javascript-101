let timerId = setTimeout(function recursive() {
    console.log('hi');
    timerId = setTimeout(recursive, 2000);
}, 2000);

setTimeout(() => {
    clearTimeout(timerId);
}, 20000);
