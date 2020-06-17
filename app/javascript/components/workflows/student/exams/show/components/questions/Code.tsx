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
  let text = state?.text ?? undefined;
  let marks = state?.marks ?? undefined;
  if (initial) {
    if ('file' in initial) {
      const f = fmap[initial.file];
      if (f?.filedir === 'dir') {
        throw new Error('Code initial cannot be a directory.');
      }
      text = text ?? f?.contents;
      marks = marks ?? f?.marks;
    } else if ('text' in initial) {
      text = text ?? initial.text;
      marks = marks ?? initial.marks;
    }
  }
  text = text ?? '';
  marks = marks ?? [];
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
