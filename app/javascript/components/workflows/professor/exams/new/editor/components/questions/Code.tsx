import React, { useState } from 'react';
import {
  Form,
  Row,
  Col,
  Button,
  ButtonGroup,
} from 'react-bootstrap';
import { MarkDescription, CodeState, CodeInfo } from '@student/exams/show/types';
import { Editor } from '@student/exams/show/components/ExamCodeBox';
import Prompted from '@professor/exams/new/editor/components/questions/Prompted';
import { FaLock, FaBan } from 'react-icons/fa';
import {
  Field,
  WrappedFieldProps,
  Fields,
  WrappedFieldsProps,
} from 'redux-form';

// TODO: starter should be a filepicker that saves a filename
// const { fmap } = useContext(ExamContext);
// const f = fmap[initial];
// if (f?.filedir === 'dir') {
//   throw new Error('Code initial cannot be a directory.');
// }
// const fileText = f?.contents ?? '';
// const fileMarks = f?.marks ?? [];


const EditLang: React.FC<WrappedFieldProps> = (props) => {
  const { input } = props;
  const {
    value,
    onChange,
  } = input;
  return (
    <Form.Control
      as="select"
      custom
      size="sm"
      className="col-sm-2"
      value={value}
      onChange={onChange}
    >
      <option value="scheme">Racket</option>
      <option value="text/x-java">Java</option>
    </Form.Control>
  );
};

const EditCodeAnswer: React.FC<WrappedFieldsProps & {
  qnum: number;
  pnum: number;
  bnum: number;
}> = (props) => {
  const {
    lang,
    answer,
    qnum,
    pnum,
    bnum,
  } = props;
  const { input } = answer;
  const {
    value,
    onChange,
  }: {
    value: CodeState,
    onChange: (newVal: CodeState) => void;
  } = input;
  const answerText = value?.text ?? '';
  const answerMarks = value?.marks ?? [];
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
      <Form.Group as={Row} controlId={`${qnum}-${pnum}-${bnum}-answer`}>
        <Form.Label column sm={2}>Answer</Form.Label>
        <Col sm={10}>
          <div className="quill bg-white">
            <div className="ql-toolbar ql-snow">
              <EditLang input={lang.input} meta={lang.meta} />
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
                      from: {
                        // don't include sticky
                        ch: curRange.from.ch,
                        line: curRange.from.line,
                      },
                      to: {
                        // don't include sticky
                        ch: curRange.to.ch,
                        line: curRange.to.line,
                      },
                      options: {
                        inclusiveLeft: curRange.from.line === 0 && curRange.from.ch === 0,
                        inclusiveRight:
                          curRange.to.line === finalPos.line
                        && curRange.to.ch === finalPos.ch,
                      },
                    };
                    newMarks.push(newMark);
                  }
                  onChange({ text: answerText, marks: newMarks });
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
                  onChange({ text: answerText, marks: [] });
                }}
              >
                <FaBan />
              </Button>
            </div>
            <Editor
              value={answerText}
              markDescriptions={answerMarks}
              valueUpdate={[answerMarks]}
              language={lang.input.value}
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
                onChange({ text: newText, marks: newMarks });
              }}
            />
          </div>
        </Col>
      </Form.Group>
    </>
  );
};

interface CodeProps {
  qnum: number;
  pnum: number;
  bnum: number;
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

const SetInitial: React.FC<WrappedFieldProps> = (props) => {
  const { input } = props;
  const {
    value,
    onChange,
  }: {
    value: CodeInfo['initial'];
    onChange: (newVal: CodeInfo['initial']) => void;
  } = input;
  const isFile = value && 'file' in value;
  const isText = value && 'text' in value;
  const isNone = !value;
  return (
    <ButtonGroup>
      <Button
        disabled
        variant={isNone ? 'secondary' : 'outline-secondary'}
        active={isNone}
        onClick={(): void => {
          onChange(null);
        }}
      >
        None
      </Button>
      <Button
        disabled
        variant={isText ? 'secondary' : 'outline-secondary'}
        active={isText}
        onClick={(): void => {
          onChange({ text: '', marks: [] });
        }}
      >
        Supply code
      </Button>
      <Button
        disabled
        variant={isFile ? 'secondary' : 'outline-secondary'}
        active={isFile}
        onClick={(): void => {
          onChange(null);
        }}
      >
        Choose a file
      </Button>
    </ButtonGroup>
  );
};

const Code: React.FC<CodeProps> = (props) => {
  const {
    qnum,
    pnum,
    bnum,
  } = props;

  return (
    <>
      <Prompted
        qnum={qnum}
        pnum={pnum}
        bnum={bnum}
      />
      <Form.Group as={Row}>
        <Form.Label column sm={2}>Starter</Form.Label>
        <Col sm={10}>
          <Field name="initial" component={SetInitial} />
        </Col>
      </Form.Group>
      <Fields names={['lang', 'answer']} component={EditCodeAnswer} qnum={qnum} pnum={pnum} bnum={bnum} />
    </>
  );
};

export default Code;
