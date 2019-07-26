class Counter {
  #count = 0; // private instance variable

  get value() {
    console.log(this.#count);
  }

  increment() {
    this.#count++;
  }
}

const counter1 = new Counter();
counter1.value;
counter1.increment();
counter1.value;
console.log(counter1.#count); // this will throw an error
