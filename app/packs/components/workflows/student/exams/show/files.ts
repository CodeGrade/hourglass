import {
  ExamFile, FileMap, FileRef,
} from '@student/exams/show/types';

export function createMap(files: ExamFile[]): FileMap {
  const ret = {};
  files.forEach((file) => {
    switch (file.filedir) {
      case 'dir':
        ret[file.relPath] = file;
        Object.assign(ret, createMap(file.nodes));
        break;
      case 'file':
        ret[file.relPath] = file;
        break;
      default:
        throw new Error('invalid file');
    }
  });
  return ret;
}

export function firstFile(files: ExamFile[]): ExamFile {
  if (files.length === 0) {
    return undefined;
  }

  const file = files[0];

  if (file.filedir === 'file') {
    return file;
  }
  if (file.filedir === 'dir') {
    const firstChild = firstFile(file.nodes);
    if (firstChild) {
      return firstChild;
    }
  }
  throw new Error('invalid file');
}

export function getFilesForRefs(map: FileMap, refs: readonly FileRef[]): ExamFile[] {
  return refs ? refs.map((r) => map[r.path]).filter((a) => a) : [];
}

export function countFiles(files: ExamFile[]): number {
  return files.reduce((acc, f) => (
    (f.filedir === 'file') ? acc + 1 : acc + countFiles(f.nodes)
  ), 0);
}
