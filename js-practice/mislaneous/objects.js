const obj1 = {
  graph: '@graph',
  node: {
    a: 'a',
    b: 'b'
  }
};

const obj2 = {
  shared: {
    c: 'c'
  },
  node: {
    d: 'd'
  }
};

const obj3 = { ...obj1, ...obj2 };

console.log(obj3['node']);

function getVersionInfo(body) {
  const versionInfo = {
    MaskID: body['MaskID']
  };
  return versionInfo;
}

console.log(getVersionInfo({ MaskID: 121 }));
