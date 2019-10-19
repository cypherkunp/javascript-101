// before the call
let menu = {
  width: 200,
  height: 300,
  title: 'My menu'
};

multiplyNumeric(menu);

function multiplyNumeric(object) {
  for (const key in object) {
    if (object.hasOwnProperty(key)) {
      object[key] = isNaN(object[key]) ? object[key] * 2 : object[key];
    }
  }
  console.log(object);
}
