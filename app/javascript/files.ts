import { FileMap, Files, FileRef } from './types';

export function createMap(files: Files): FileMap {
  const ret = {};
  for (const file of files) {
    switch (file.filedir) {
      case 'dir':
        ret[file.rel_path] = file;
        const children = createMap(file.nodes);
        Object.assign(ret, children);
        break;
      case 'file':
        ret[file.rel_path] = file;
        break;
      default:
        throw new Error('invalid file');
    }
  }
  return ret;
}

export function getFilesForRefs(map: FileMap, refs: FileRef[]): Files {
  return refs ? refs.map((r) => map[r.path]).filter((a) => a) : [];
}
