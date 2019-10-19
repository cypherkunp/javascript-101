const json = {
  F112: {
    identifier: 'dcterms:description',
    name: 'Text'
  },
  ID: {
    identifier: 'dcterms:identifier',
    name: 'ID'
  },
  F112: {
    identifier: 'dcterms:title',
    name: 'Live Item ID'
  }
};

for (const key in json) {
  if (json.hasOwnProperty(key)) {
    const element = json[key];
    console.log(key, element);
  }
}
