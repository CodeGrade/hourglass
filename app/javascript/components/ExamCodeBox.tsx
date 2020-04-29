import CM from 'codemirror';
import 'codemirror/addon/runmode/runmode';
import 'codemirror/addon/selection/active-line';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/theme/mdn-like';
import React from 'react';
import Highlighter from 'react-codemirror-runmode';
import { Controlled as ControlledCodeMirror, IControlledCodeMirror } from 'react-codemirror2';

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
    count, lines, text: lines.join('\n'), marks,
  };
}

function applyMarks(cm, allMarks) {
  const curCol = 0;
  const curLine = 0;
  const openMarks = ' ';
  allMarks.byLine.forEach((lineMarks) => {
    lineMarks.forEach((colMarks) => {
      colMarks.open.forEach((mark) => {
        cm.markText({ line: mark.startLine, ch: mark.startCol },
          { line: mark.endLine, ch: mark.endCol },
          {
            inclusiveLeft: mark.lockBefore,
            inclusiveRight: mark.lockAfter,
            readOnly: true,
            className: 'readOnly',
          });
      });
    });
  });
}

export interface EditorProps extends IControlledCodeMirror {
  readOnly?: boolean;
  lineNumbers?: boolean;
  language?: string;
}

export const Editor = ({
  options, readOnly, lineNumbers, language, value, ...props
}: Partial<EditorProps>) => {
  const myOptions = {
    theme: 'mdn-like',
    indentUnit: 2,
    viewportMargin: Infinity,
    lineNumbers: (lineNumbers ?? true),
    lineWrapping: false,
    mode: language,
    extraKeys: CM.normalizeKeyMap({
      Enter: 'newlineAndIndent',
      Tab: 'indentAuto',
    }),
    readOnly,
    ...options,
  };
  return (
    <ControlledCodeMirror
      onBeforeChange={() => {}}
      value={value}
      {...props}
      options={myOptions}
    />
  );
};

export const Renderer = ({ value, ...props }) => (
  <Highlighter value={value} codeMirror={CM} theme="mdn-like" {...props} />
);
