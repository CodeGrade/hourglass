import React, { useContext, useState } from 'react';
import {
  Form,
  Row,
  Col,
  Button,
} from 'react-bootstrap';
import { CodeInfoWithAnswer, MarkDescription } from '@student/exams/show/types';
import { ExamContext } from '@student/exams/show/context';
import { Editor } from '@student/exams/show/components/ExamCodeBox';
import Prompted from '@professor/exams/new/editor/components/questions/Prompted';
import { FaLock, FaBan } from 'react-icons/fa';

interface CodeProps {
  qnum: number;
  pnum: number;
  bnum: number;
  info: CodeInfoWithAnswer;
  onChange: (newVal: CodeInfoWithAnswer) => void;
}

interface CMRange {
  from: CodeMirror.Position;
  to: CodeMirror.Position;
}

interface LockStateInfo {
  enabled: boolean;
  active: boolean;
  curRange?: CMRange;
  finalPos?: CodeMirror.Position;
}

const Code: React.FC<CodeProps> = (props) => {
  // TODO: starter should be a filepicker that saves a filename,
  // right now it just modifies "answer", which is wrong
  const {
    info,
    qnum,
    pnum,
    bnum,
    onChange,
  } = props;
  const { prompt, lang, initial } = info;
  const { fmap } = useContext(ExamContext);
  const f = fmap[initial];
  if (f?.filedir === 'dir') {
    throw new Error('Code initial cannot be a directory.');
  }
  const answerText = info.answer?.text ?? '';
  const answerMarks = info.answer?.marks ?? [];

  const fileText = f?.contents ?? '';
  const fileMarks = f?.marks ?? [];
  const [lockState, setLockState] = useState<LockStateInfo>({
    enabled: false,
    active: false,
  });
  let title: string;
  if (lockState.enabled) {
    if (lockState.active) {
      title = 'Region locked; click to unlock';
    } else {
      title = 'Lock region';
    }
  } else {
    title = 'No region selected to lock';
  }
  return (
    <>
      <Prompted
        qnum={qnum}
        pnum={pnum}
        bnum={bnum}
        prompt={prompt.value}
        onChange={(newPrompt): void => {
          onChange({
            ...info,
            prompt: {
              type: 'HTML',
              value: newPrompt,
            },
          });
        }}
      />
      <Form.Group as={Row} controlId={`${qnum}-${pnum}-${bnum}-answer`}>
        <Form.Label column sm={2}>Answer</Form.Label>
        <Col sm={10}>
          <div className="quill bg-white">
            <div className="ql-toolbar ql-snow">
              <Form.Control
                as="select"
                custom
                size="sm"
                className="col-sm-2"
                value={lang}
                onChange={(e): void => {
                  onChange({ ...info, lang: e.target.value });
                }}
              >
                <option value="scheme">Racket</option>
                <option value="text/x-java">Java</option>
              </Form.Control>
              <Button
                className="float-none"
                variant="outline-secondary"
                size="sm"
                disabled={!lockState.enabled}
                active={lockState.active}
                title={title}
                onClick={(): void => {
                  const newMarks = [...answerMarks];
                  const { curRange, finalPos } = lockState;
                  if (lockState.active) {
                    const markId = answerMarks.findIndex((m) => (
                      m.from.ch === curRange.from.ch
                      && m.from.line === curRange.from.line
                      && m.to.ch === curRange.to.ch
                      && m.to.line === curRange.to.line
                    ));
                    newMarks.splice(markId, 1);
                  } else {
                    const newMark: MarkDescription = {
                      from: curRange.from,
                      to: curRange.to,
                      options: {
                        inclusiveLeft: curRange.from.line === 0 && curRange.from.ch === 0,
                        inclusiveRight:
                          curRange.to.line === finalPos.line
                          && curRange.to.ch === finalPos.ch,
                      },
                    };
                    newMarks.push(newMark);
                  }
                  onChange({ ...info, answer: { text: answerText, marks: newMarks } });
                }}
              >
                <FaLock />
              </Button>
              <Button
                className="float-none"
                variant="outline-secondary"
                size="sm"
                title="Clear all locked regions"
                onClick={(): void => {
                  onChange({ ...info, answer: { text: answerText, marks: [] } });
                }}
              >
                <FaBan />
              </Button>
            </div>
            <Editor
              value={answerText}
              markDescriptions={answerMarks}
              valueUpdate={[answerMarks]}
              language={lang}
              onSelection={(editor, data): void => {
                const { ranges, origin } = data;
                if (origin === undefined) return;
                if (ranges.length > 0) {
                  const curRange = ranges[0];
                  const selectedMarks = editor.findMarks(curRange.from(), curRange.to());
                  const lastLine = editor.lastLine();
                  const lastLineLen = editor.getLine(lastLine).length;
                  if (selectedMarks.length === 0) {
                    setLockState({
                      enabled: !curRange.empty(),
                      active: false,
                      curRange: { from: curRange.from(), to: curRange.to() },
                      finalPos: { line: lastLine, ch: lastLineLen },
                    });
                  } else {
                    const markRange = selectedMarks[0].find();
                    setLockState({
                      active: true,
                      enabled: true,
                      curRange: markRange,
                      finalPos: { line: lastLine, ch: lastLineLen },
                    });
                  }
                }
              }}
              onChange={(newText, newMarks): void => {
                onChange({ ...info, answer: { text: newText, marks: newMarks } });
              }}
            />
          </div>
        </Col>
      </Form.Group>
    </>
  );
};
export default Code;
