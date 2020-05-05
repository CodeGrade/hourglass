import {
  ExamFile, FileMap, FileRef,
} from '@hourglass/types';

export function createMap(files: ExamFile[]): FileMap {
  const ret = {};
  for (const file of files) {
    switch (file.filedir) {
      case 'dir':
        ret[file.relPath] = file;
        const children = createMap(file.nodes);
        Object.assign(ret, children);
        break;
      case 'file':
        ret[file.relPath] = file;
        break;
      default:
        throw new Error('invalid file');
    }
  }
  return ret;
}

export function firstFile(files: ExamFile[]): ExamFile {
  for (const file of files) {
    switch (file.filedir) {
      case 'file':
        return file;
      case 'dir':
        const firstChild = firstFile(file.nodes);
        if (firstChild) {
          return firstChild;
        }
    }
  }
  return undefined;
}

export function getFilesForRefs(map: FileMap, refs: FileRef[]): ExamFile[] {
  return refs ? refs.map((r) => map[r.path]).filter((a) => a) : [];
}
