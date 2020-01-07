function compareObject(firstObject, secondObject) {
  const fProps = Object.getOwnPropertyNames(firstObject);
  const sProps = Object.getOwnPropertyNames(secondObject);

  if (fProps.length != sProps.length) {
    return false;
  }

  for (const key in firstObject) {
    console.log('key: ', key);

    if (!(firstObject.hasOwnProperty(key) && secondObject.hasOwnProperty(key))) {
      return false;
    } else {
      if (!(firstObject[key] === secondObject[key])) {
        return false;
      }
    }
  }

  return true;
}

function isEquivalent(obj1, obj2) {
  const obj1Props = Object.getOwnPropertyNames(obj1);
  const obj2Props = Object.getOwnPropertyNames(obj2);

  if (obj1Props.length != obj2Props.length) {
    return false;
  }

  for (let index = 0; index < obj1Props.length; index++) {
    const key = obj1Props[index];

    if (obj1[key] !== obj2[key]) {
      return false;
    }
  }
  return true;
}

const object1 = {
  name: 'Devvrat',
  active: true
};

const object2 = {
  name: 'Devvrat',
  active: false,
  contactNo: 123456
};

console.log('compare: ', compareObject(object1, object2));
console.log('compare: ', isEquivalent(object1, object2));
console.log('compare: ', isEquivalent(object1, object2));
