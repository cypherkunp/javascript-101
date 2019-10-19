function speak() {
    console.log(`hello, ${this.name}`);
}

const user = {
    name: 'Jhon'
};
user.speak = speak;
user.speak();
