export const expressions = {
  number: {
    name: 'number',
    reg: /^(\d*\.\d*([Ee]?[+-]?\d+)?(?=[^\w])|\d[a-fA-F\d]*[hH](?=[^\w])|[0-1]+[bB](?=[^\w])|[0-8]+[oO](?=[^\w])|\d*[eE][+-]?\d+(?=[^\w])|\d+[dD]?(?=[^\w]))/,
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

export const numbers = {
  real: /d*.d*([Ee]?[+-]?d+)?$/,
  bin: /[0-1]+[bB]$/,
  oct: /[0-8]+[oO]$/,
  dec: /\d+[dD]?$/,
  hex: /\d[a-fA-F\d]*[hH]$/
};