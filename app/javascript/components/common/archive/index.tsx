import { ExamFile, ExamDir, ExamSingleFile } from '@student/exams/show/types';
import JSZip, { loadAsync } from 'jszip';
import mime from '@hourglass/common/mime';
import { extractMarks } from '@hourglass/common/archive/fileMarks';

export async function handleDir(root: JSZip): Promise<ExamFile[]> {
  const ret = [];
  const promises = [];
  root.forEach((path, file) => {
    if (file.dir) return;
    const exploded = path.split('/');
    const fileName = exploded.pop();
    let current = ret;
    const pathSoFar = [];
    exploded.forEach((segment) => {
      pathSoFar.push(segment);
      const dir = current.find((f) => f.text === `${segment}/`);
      if (dir) {
        current = dir.nodes;
      } else {
        const examDir: ExamDir = {
          filedir: 'dir',
          text: `${segment}/`,
          path: segment,
          relPath: pathSoFar.join('/'),
          nodes: [],
        };
        current.push(examDir);
        current = examDir.nodes;
      }
    });
    promises.push(new Promise<void>((resolve) => {
      file.async('text').then((contents) => {
        const { text, marks } = extractMarks(contents);
        const examFile: ExamSingleFile = {
          filedir: 'file',
          text: fileName,
          path: fileName,
          relPath: path,
          marks,
          type: mime(fileName),
          contents: text,
        };
        current.push(examFile);
        resolve();
      });
    }));
  });
  await Promise.all(promises);
  return Object.values(ret);
}

export async function handleZip(file: File): Promise<ExamFile[]> {
  const unzipped = await loadAsync(file);
  const files = await handleDir(unzipped);
  return files;
}
