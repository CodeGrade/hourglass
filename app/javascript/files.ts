import { FileMap, Files, FileRef } from './types';


export function getFilesForRefs(map: FileMap, refs: FileRef[]): Files {
  return refs ? refs.map(r => map[r.path]).filter(a => a) : [];
}
