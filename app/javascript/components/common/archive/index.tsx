import React, { useState, useEffect } from 'react';
import { Form } from 'react-bootstrap';
import { VeryControlledFileViewer } from '@student/exams/show/components/FileViewer';
import { ExamFile, ExamDir, ExamSingleFile } from '@student/exams/show/types';
import JSZip, { loadAsync } from 'jszip';
import mime from '@hourglass/common/mime';
import { extractMarks } from '@hourglass/common/archive/fileMarks';


async function handleDir(root: JSZip): Promise<ExamFile[]> {
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
          relPath: pathSoFar.join('/'),
          nodes: [],
        };
        current.push(examDir);
        current = examDir.nodes;
      }
    });
    promises.push(new Promise((resolve) => {
      file.async('text').then((contents) => {
        const { text, marks } = extractMarks(contents);
        const examFile: ExamSingleFile = {
          filedir: 'file',
          text: fileName,
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

const Archive: React.FC<{}> = () => {
  const [file, setFile] = useState<File>(undefined);
  const [allFiles, setAllFiles] = useState<ExamFile[]>([]);
  useEffect(() => {
    if (!file) return;
    handleZip(file).then(setAllFiles);
  }, [file]);
  return (
    <Form>
      <Form.Group>
        <Form.File
          required
          onChange={(e): void => {
            const { files } = e.target;
            const upload = files[0];
            if (upload) setFile(upload);
          }}
          label={file?.name ?? 'Choose a file'}
          accept="application/zip,.yaml,.yml"
          custom
        />
      </Form.Group>
      <Form.Group>
        <VeryControlledFileViewer files={allFiles} />
      </Form.Group>
    </Form>
  );
};

export default Archive;
