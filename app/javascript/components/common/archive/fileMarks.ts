interface MarksInfo {
  byLine: unknown[];
  byNum: {
    [num: number]: {
      startLine: number;
      startCol: number;
      number: number;
      endLine: number;
      endCol: number;
      lockBefore: boolean;
      lockAfter?: boolean;
    };
  };
}

interface CMMarkInfo {
  from: { line: number; ch: number };
  to: { line: number; ch: number };
  options: { inclusiveLeft: boolean; inclusiveRight: boolean };
}

export interface FileMarksInfo {
  count: number;
  text: string;
  lines: string[];
  marks: CMMarkInfo[];
}

export function extractMarks(text: string): FileMarksInfo {
  const lines = text.split(/\r\n?|\n/);
  if (/^\s*$/.test(lines[0])) { lines.shift(); }
  if (/^\s*$/.test(lines[lines.length - 1])) { lines.pop(); }
  const marks: MarksInfo = { byLine: [], byNum: Object.create(null) };
  let count = 0;
  for (let lineNo = 0; lineNo < lines.length; lineNo += 1) {
    marks.byLine[lineNo] = [];
    let idx: number;
    // eslint-disable-next-line no-cond-assign
    while ((idx = lines[lineNo].search(/~ro:\d+:[se]~/)) >= 0) {
      const m = lines[lineNo].match(/~ro:(\d+):([se])~/);
      lines[lineNo] = lines[lineNo].replace(m[0], '');
      if (m[2] === 's') {
        count += 1;
        marks.byNum[m[1]] = {
          startLine: lineNo,
          startCol: idx,
          endLine: lineNo,
          endCol: lineNo,
          number: m[1],
          lockBefore: (lineNo === 0 && idx === 0),
        };
        if (marks.byLine[lineNo][idx] === undefined) {
          marks.byLine[lineNo][idx] = { open: [], close: [] };
        }
        marks.byLine[lineNo][idx].open.push(marks.byNum[m[1]]);
      } else if (marks.byNum[m[1]] !== undefined) {
        marks.byNum[m[1]].endLine = lineNo;
        marks.byNum[m[1]].endCol = idx;
        marks.byNum[m[1]].lockAfter = ((lineNo === lines.length - 1)
          && (idx === lines[lineNo].length));
        if (marks.byLine[lineNo][idx] === undefined) {
          marks.byLine[lineNo][idx] = { open: [], close: [] };
        }
        marks.byLine[lineNo][idx].close.unshift(marks.byNum[m[1]]);
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
