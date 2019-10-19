class PrivateProperty {
    getValue(){
        return this.value;
    }

    setValue(v){
        this.value = v;
    }
}

const pp = new PrivateProperty();

console.log(pp.getValue());
pp.setValue(5);
console.log(pp.getValue());
console.log(pp.value);

// NO WAY TO CREATE PRIVATE IN CLASS SYNTAX other than #value, intdocued in node 12