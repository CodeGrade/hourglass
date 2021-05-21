import React, { useState, useContext } from 'react';
import {
  Form,
  Row,
  Col,
  Button,
  ButtonGroup,
} from 'react-bootstrap';
import { MarkDescription, CodeState, CodeInfo, CodeInitialContents } from '@student/exams/show/types';
import { Editor, marksToDescs } from '@student/exams/show/components/ExamCodeBox';
import Prompted from '@hourglass/workflows/professor/exams/new/editor/questions/Prompted';
import { FaLock, FaBan } from 'react-icons/fa';
import { ExamContext } from '@hourglass/common/context';
import { firstFile } from '@student/exams/show/files';
import { FilePickerSelectWithPreview } from '@hourglass/workflows/professor/exams/new/editor/FilePicker';

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

 // TODO debounce me!!
const EditCodeAnswerValues: React.FC<{
  lang: CodeInfo['lang'];
  onChangeLang: (newLang: CodeInfo['lang']) => void;
  value: CodeState;
  onChangeValue: (newVal: CodeState) => void;
}> = (props) => {
  const {
    lang,
    onChangeLang,
    value,
    onChangeValue,
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
            onChangeValue({ text: answerText, marks: newMarks });
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
            onChangeValue({ text: answerText, marks: [] });
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
          onChangeValue({ text: newText, marks: newMarks });
        }}
      />
    </div>
  );
};

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

const SetInitial: React.FC<{
  initial: CodeInfo['initial'];
  lang: CodeInfo['lang'];
  onChangeInitial: (newVal: CodeInfo['initial']) => void;
  onChangeLang: (newVal: CodeInfo['lang']) => void;
}> = (props) => {
  const {
    initial,
    lang,
    onChangeInitial,
    onChangeLang,
  } = props;
  const isFile = initial && 'file' in initial;
  const isText = initial && 'text' in initial;
  const isNone = !initial;
  const { files } = useContext(ExamContext);
  const first = firstFile(files);
  return (
    <>
      <ButtonGroup>
        <Button
          variant={isNone ? 'secondary' : 'outline-secondary'}
          active={isNone}
          onClick={(): void => {
            onChangeInitial(null);
          }}
        >
          None
        </Button>
        <Button
          variant={isText ? 'secondary' : 'outline-secondary'}
          active={isText}
          onClick={(): void => {
            onChangeInitial({ text: '', marks: [] });
          }}
        >
          Supply code
        </Button>
        <Button
          variant={isFile ? 'secondary' : 'outline-secondary'}
          active={isFile}
          onClick={(): void => {
            onChangeInitial({ file: first.relPath });
          }}
        >
          Choose a file
        </Button>
      </ButtonGroup>
      {initial && 'text' in initial && (
        <EditCodeAnswerValues
          value={initial}
          onChangeValue={onChangeInitial}
          lang={lang}
          onChangeLang={onChangeLang}
        />
      )}
      {initial && 'file' in initial && (
        <>
          <FilePickerSelectWithPreview
            options={files}
            selected={[{
              type: 'file',
              path: initial.file,
            }]}
            onChange={(arr): void => {
              const lastSelected = arr[arr.length - 1];
              if (!lastSelected) return;
              if (lastSelected.type === 'dir') return;
              onChangeInitial({ file: lastSelected.path });
            }}
          />
        </>
      )}
    </>
  );
};

const Code: React.FC<{
  info: CodeInfo;
  id: string;
  answer: CodeState;
}> = (props) => {
  const {
    info,
    id,
    answer,
  } = props;
  return (
    <>
      <Prompted
        prompt={info.prompt}
      />
      <Form.Group as={Row}>
        <Form.Label column sm={2}>Starter</Form.Label>
        <Col sm={10}>
          <SetInitial
            initial={info.initial}
            onChangeInitial={console.log}
            lang={info.lang}
            onChangeLang={console.log}
          />
        </Col>
      </Form.Group>
      <Form.Group as={Row}>
        <Form.Label column sm={2}>Answer</Form.Label>
        <Col sm={10}>
          <EditCodeAnswerValues
            lang={info.lang}
            onChangeLang={console.log}
            value={answer}
            onChangeValue={console.log}
          />
        </Col>
      </Form.Group>
    </>
  );
};

export default Code;
