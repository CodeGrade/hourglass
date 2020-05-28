import React, { useContext } from 'react';
import { Form, Row, Col } from 'react-bootstrap';
import { CodeInfo, CodeState } from '@student/exams/show/types';
import { ExamContext } from '@student/exams/show/context';
import { Editor } from '@student/exams/show/components/ExamCodeBox';
import Prompted from '@professor/exams/new/editor/components/questions/Prompted';

interface CodeProps {
  qnum: number;
  pnum: number;
  bnum: number;
  info: CodeInfo;
  state: CodeState;
  onChange?: (newInfo: CodeInfo, newVal: CodeState) => void;
  disabled: boolean;
}

const Code: React.FC<CodeProps> = (props) => {
  const {
    info,
    qnum,
    pnum,
    bnum,
    state,
    onChange,
    disabled,
  } = props;
  const { prompt, lang, initial } = info;
  const { fmap } = useContext(ExamContext);
  const f = fmap[initial];
  if (f?.filedir === 'dir') {
    throw new Error('Code initial cannot be a directory.');
  }
  const text = state?.text ?? f?.contents ?? '';
  const marks = state?.marks ?? f?.marks ?? [];

  return (
    <>
      <Prompted
        qnum={qnum}
        pnum={pnum}
        bnum={bnum}
        prompt={prompt}
        onChange={(newPrompt): void => {
          if (onChange) { onChange({ ...info, prompt: newPrompt }, state); }
        }}
      />
      <Form.Group as={Row} controlId={`${qnum}-${pnum}-${bnum}-answer`}>
        <Form.Label column sm={2}>Starter</Form.Label>
        <Col sm={10}>
          <div>
            <div className="ql-toolbar">
              TODO
            </div>
            <Editor
              disabled={disabled}
              value={text}
              markDescriptions={marks}
              valueUpdate={[disabled]}
              language={lang}
              onChange={(newText, newMarks): void => {
                if (onChange) {
                  onChange(
                    info,
                    {
                      text: newText,
                      marks: newMarks,
                    },
                  );
                }
              }}
            />
          </div>
        </Col>
      </Form.Group>
    </>
  );
};
export default Code;
