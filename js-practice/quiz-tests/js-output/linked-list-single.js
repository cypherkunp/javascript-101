let list = {
    value: 1,
    next: {
        value: 2,
        next: {
            value: 3,
            next: {
                value: 4,
                next: null
            }
        }
    }
};

// loop based
function printList(list) {
    while (list) {
        console.log(list.value);
        list = list.next;
    }
}
printList(list);

function printListR(list) {
    console.log(list.value);
    if (list.next) printListR(list.next);
}
printListR(list);
