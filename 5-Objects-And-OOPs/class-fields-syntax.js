class Animal {
  constructor(name) {
    this.name = name;
  }
}

class Cat extends Animal {
  likesTakingBath = false;
  // No need to call super()
  meow() {
    console.log('Meeeow! by ' + this.name);
  }
}

const cat = new Cat('Tom');
cat.meow();
