class Chameleon {
  static colorChange(newColor) {
    this.newColor = newColor;
  }

  constructor({ newColor = 'green' } = {}) {
    this.newColor = newColor;
  }
}

Chameleon.colorChange('orange');
console.log(Chameleon.newColor);

const freddie = new Chameleon({ newColor: 'purple' });
freddie.colorChange('orange'); // TypeError: freddie.colorChange is not a function
console.log(freddie.newColor);
