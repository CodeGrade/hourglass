import React, { useContext } from 'react';
import { Row, Col } from 'react-bootstrap';
import { CodeInfo, CodeState } from '@student/exams/show/types';
import { ExamContext } from '@student/exams/show/context';
import HTML from '@student/exams/show/components/HTML';
import { Editor } from '../ExamCodeBox';

interface CodeProps {
  info: CodeInfo;
  value: CodeState;
  onChange?: (newVal: CodeState) => void;
  disabled: boolean;
}

const Code: React.FC<CodeProps> = (props) => {
  const {
    info,
    value: state,
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
      <Row>
        <Col>
          <HTML value={prompt} />
        </Col>
      </Row>
      <Row>
        <Col>
          <Editor
            disabled={disabled}
            value={text}
            markDescriptions={marks}
            valueUpdate={[disabled]}
            language={lang}
            onChange={(newText, newMarks): void => {
              if (onChange) {
                onChange({
                  text: newText,
                  marks: newMarks,
                });
              }
            }}
          />
        </Col>
      </Row>
    </>
  );
};
export default Code;
