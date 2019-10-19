const preferHeaderValue = '';

console.log(typeof preferHeaderValue === 'string');
console.log(preferHeaderValue);

if (typeof preferHeaderValue === 'string') {
  let value = preferHeaderValue.split(';');

  let isReturnValuePresent = value[0] === `return=representation`;
  let isIncludeValuePresent =
    value[1] === `include="http://open-services.net/ns/core#PreferCompact"`;

  console.log('True:', value);
}

let json = {
  type: {
    t2: {
      name: "'Requirement'"
    }
  }
};

json = JSON.parse(json);
console.log(json);
