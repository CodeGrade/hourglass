import React, { useState, useEffect } from 'react';
import { Form } from 'react-bootstrap';
import { VeryControlledFileViewer } from '@hourglass/workflows/student/exams/show/components/FileViewer';
import { ExamFile, ExamDir, ExamSingleFile } from '@hourglass/workflows/student/exams/show/types';
import JSZip, { loadAsync } from 'jszip';
import mime from '@hourglass/common/mime';

function extractMarks(text) {
  const lines = text.split(/\r\n?|\n/);
  if (/^\s*$/.test(lines[0])) { lines.shift(); }
  if (/^\s*$/.test(lines[lines.length - 1])) { lines.pop(); }
  const marks = { byLine: [], byNum: Object.create(null) };
  let count = 0;
  for (let lineNo = 0; lineNo < lines.length; lineNo++) {
    marks.byLine[lineNo] = [];
    let idx;
    while ((idx = lines[lineNo].search(/~ro:\d+:[se]~/)) >= 0) {
      const m = lines[lineNo].match(/~ro:(\d+):([se])~/);
      lines[lineNo] = lines[lineNo].replace(m[0], '');
      if (m[2] === 's') {
        count++;
        marks.byNum[m[1]] = {
          startLine: lineNo,
          startCol: idx,
          number: m[1],
          lockBefore: (lineNo == 0 && idx == 0),
        };
        if (marks.byLine[lineNo][idx] === undefined) marks.byLine[lineNo][idx] = { open: [], close: [] };
        marks.byLine[lineNo][idx].open.push(marks.byNum[m[1]]);
      } else if (marks.byNum[m[1]] !== undefined) {
        marks.byNum[m[1]].endLine = lineNo;
        marks.byNum[m[1]].endCol = idx;
        marks.byNum[m[1]].lockAfter = (lineNo == lines.length - 1) && (idx == lines[lineNo].length);
        if (marks.byLine[lineNo][idx] === undefined) marks.byLine[lineNo][idx] = { open: [], close: [] };
        marks.byLine[lineNo][idx].close.unshift(marks.byNum[m[1]]);
      } else {
        console.error(`No information found for mark [${m.join(', ')}]`);
      }
    }
  }

  return {
    count,
    lines,
    text: lines.join('\n'),
    marks: Object.values(marks.byNum).map((m) => ({
      from: {
        line: m.startLine,
        ch: m.startCol,
      },
      to: {
        line: m.endLine,
        ch: m.endCol,
      },
      options: {
        inclusiveLeft: m.lockBefore,
        inclusiveRight: m.lockAfter,
      },
    })),
  };
}

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
        console.log('marks', marks);
        console.log('text', text);
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

async function handleZip(file: File): Promise<ExamFile[]> {
  const unzipped = await loadAsync(file);
  console.log(unzipped);
  const files = await handleDir(unzipped);
  console.log(files);
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
