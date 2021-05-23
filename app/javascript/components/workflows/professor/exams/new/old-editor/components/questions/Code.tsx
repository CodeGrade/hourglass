import React, { useState, useContext } from 'react';
import {
  Form,
  Row,
  Col,
  Button,
  ButtonGroup,
} from 'react-bootstrap';
import { MarkDescription, CodeState, CodeInfo } from '@student/exams/show/types';
import { Editor, marksToDescs } from '@student/exams/show/components/ExamCodeBox';
import Prompted from '@professor/exams/new/old-editor/components/questions/Prompted';
import { FaLock, FaBan } from 'react-icons/fa';
import {
  Field,
  WrappedFieldProps,
  Fields,
  WrappedFieldsProps,
} from 'redux-form';
import { ExamContext } from '@hourglass/common/context';
import { firstFile } from '@student/exams/show/files';
import { FilePickerSelectWithPreview } from '@professor/exams/new/old-editor/components/FilePicker';

export const languages = {
  scheme: 'Racket',
  'text/x-java': 'Java',
  'text/x-python': 'Python',
  'text/javascript': 'Javascript',
  mllike: 'ML',
  'text/x-ebnf': 'ML Yacc',
  'text/x-csrc': 'C',
  'text/x-c++src': 'C++',
  // pyret: 'Pyret',
  'text/html': 'HTML',
  'text/css': 'CSS',
  'application/xml': 'XML',
};

const EditLang: React.FC<{
  value: CodeInfo['lang'];
  onChange: (newLang: CodeInfo['lang']) => void;
}> = (props) => {
  const {
    value,
    onChange,
  } = props;
  return (
    <Form.Control
      as="select"
      custom
      size="sm"
      className="col-sm-2"
      value={value}
      onChange={(e): void => onChange(e.target.value)}
    >
      {Object.keys(languages).map((k) => <option key={k} value={k}>{languages[k]}</option>)}
    </Form.Control>
  );
};

const EditCodeAnswerValues: React.FC<{
  lang: CodeInfo['lang'];
  onChangeLang: (newLang: CodeInfo['lang']) => void;
  value: CodeState;
  onChangeVal: (newVal: CodeState) => void;
}> = (props) => {
  const {
    lang,
    onChangeLang,
    value,
    onChangeVal,
  } = props;
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
    <div className="quill bg-white">
      <div className="ql-toolbar ql-snow">
        <EditLang onChange={onChangeLang} value={lang} />
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
                  ch: curRange.from.ch,
                  line: curRange.from.line,
                },
                to: {
                  ch: curRange.to.ch,
                  line: curRange.to.line,
                },
                options: {
                  inclusiveLeft: (
                    curRange.from.line === 0
                    && curRange.from.ch === 0
                  ),
                  inclusiveRight: (
                    curRange.to.line === finalPos.line
                    && curRange.to.ch === finalPos.ch
                  ),
                },
              };
              newMarks.push(newMark);
            }
            onChangeVal({ text: answerText, marks: newMarks });
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
            onChangeVal({ text: answerText, marks: [] });
          }}
        >
          <FaBan />
        </Button>
      </div>
      <Editor
        value={answerText}
        markDescriptions={answerMarks}
        valueUpdate={answerMarks}
        language={lang}
        onSelection={(editor, data): void => {
          const { ranges, origin } = data;
          if (origin === undefined) return;
          if (ranges.length > 0) {
            const curRange = ranges[0];
            const selectedMarks = marksToDescs(editor.findMarks(curRange.from(), curRange.to()));
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
              const activeMark = selectedMarks[0];
              setLockState({
                active: true,
                enabled: true,
                curRange: {
                  from: activeMark.from,
                  to: activeMark.to,
                },
                finalPos: { line: lastLine, ch: lastLineLen },
              });
            }
          }
        }}
        onChange={(newText, newMarks): void => {
          onChangeVal({ text: newText, marks: newMarks });
        }}
      />
    </div>
  );
};

const EditCodeAnswer: React.FC<WrappedFieldsProps> = (props) => {
  const {
    lang,
    answer,
  } = props;
  const { input } = answer;
  const {
    value,
    onChange,
  }: {
    value: CodeState,
    onChange: (newVal: CodeState) => void;
  } = input;
  return (
    <EditCodeAnswerValues
      lang={lang.input.value}
      onChangeLang={lang.input.onChange}
      value={value}
      onChangeVal={onChange}
    />
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

const EditSuppliedCode: React.FC<WrappedFieldsProps> = (props) => {
  const {
    lang,
    initial,
  } = props;
  return (
    <EditCodeAnswerValues
      lang={lang.input.value}
      onChangeLang={lang.input.onChange}
      value={initial.input.value}
      onChangeVal={initial.input.onChange}
    />
  );
};

const langInitial = ['lang', 'initial'];
const SetInitial: React.FC<WrappedFieldProps> = (props) => {
  const {
    input,
  } = props;
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
  const { files } = useContext(ExamContext);
  const first = firstFile(files);
  return (
    <>
      <ButtonGroup>
        <Button
          variant={isNone ? 'secondary' : 'outline-secondary'}
          active={isNone}
          onClick={(): void => {
            onChange(null);
          }}
        >
          None
        </Button>
        <Button
          variant={isText ? 'secondary' : 'outline-secondary'}
          active={isText}
          onClick={(): void => {
            onChange({ text: '', marks: [] });
          }}
        >
          Supply code
        </Button>
        <Button
          variant={isFile ? 'secondary' : 'outline-secondary'}
          active={isFile}
          onClick={(): void => {
            onChange({ file: first.relPath });
          }}
        >
          Choose a file
        </Button>
      </ButtonGroup>
      {isText && (
        <Fields
          names={langInitial}
          component={EditSuppliedCode}
        />
      )}
      {value && 'file' in value && (
        <>
          <FilePickerSelectWithPreview
            options={files}
            selected={[{
              type: 'file',
              path: value.file,
            }]}
            onChange={(arr): void => {
              const lastSelected = arr[arr.length - 1];
              if (!lastSelected) return;
              if (lastSelected.type === 'dir') return;
              onChange({ file: lastSelected.path });
            }}
          />
        </>
      )}
    </>
  );
};

const langAnswer = ['lang', 'answer'];
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
      <Form.Group as={Row} controlId={`${qnum}-${pnum}-${bnum}-starter`}>
        <Form.Label column sm={2}>Starter</Form.Label>
        <Col sm={10}>
          <Field
            name="initial"
            component={SetInitial}
          />
        </Col>
      </Form.Group>
      <Form.Group as={Row} controlId={`${qnum}-${pnum}-${bnum}-answer`}>
        <Form.Label column sm={2}>Answer</Form.Label>
        <Col sm={10}>
          <Fields
            names={langAnswer}
            component={EditCodeAnswer}
          />
        </Col>
      </Form.Group>
    </>
  );
};

export default Code;
