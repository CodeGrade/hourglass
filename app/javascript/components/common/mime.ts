import mime from 'mime';

mime.define({
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
      return mime.getType(fname) ?? 'text/plain';
  }
};
