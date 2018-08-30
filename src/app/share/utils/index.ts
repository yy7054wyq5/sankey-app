const objToArr = (obj: { [id: string]: any }) => {
  const _tmp = [];
  for (const id in obj) {
    if (obj.hasOwnProperty(id)) {
      const node = obj[id];
      _tmp.push(node);
    }
  }
  return _tmp;
};

export { objToArr };
