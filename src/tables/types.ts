export const identifiers = {
  number: {
    name: 'number',
    reg: /^(\d*\.\d*([Ee]?[+-]?\d+)?(?=[^\w])|\d[a-fA-F\d]*[hH](?=[^\w])|[0-1]+[bB](?=[^\w])|[0-8]+[oO](?=[^\w])|\d*[eE][+-|]?\d+(?=[^\w])|\d+[dD]?(?=[^\w]))/,
  },
  space: {
    name: 'space',
    reg: /^(\s|\\n|\\r)/,
  },
  word: {
    name: 'word',
    reg: /^[A-Za-z][A-Za-z0-9]*/,
  },
  comment: {
    name: 'comment',
    reg: /^\/\*.*?\*\//,
  },
};
