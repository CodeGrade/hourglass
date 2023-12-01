import defaultMime, { Mime } from 'mime';

const customMime = new Mime();

customMime.define({
  scheme: ['rkt', 'ss'],
  pyret: ['arr'],
  mllike: ['ml', 'mli'],
  'text/x-ebnf': ['mly'],
  'text/x-csrc': ['c', 'h'],
  'text/x-c++src': ['cpp', 'c'],
  'text/x-csharp': ['cs'],
  'application/xml': ['svg', 'xml'],
  'text/x-yaml': ['yml', 'yaml'],
  'text/x-java': ['java'],
}, true);

export default (name: string): string => {
  const fname = name.toLowerCase();
  switch (fname) {
    case 'makefile':
      return 'text/x-makefile';
    default:
      return customMime.getType(fname) ?? defaultMime.getType(fname) ?? 'text/plain';
  }
};
