import React from 'react';
import { Row, Col } from 'react-bootstrap';
import { CodeInfo, CodeState } from '@hourglass/types';
import { useExamContext } from '@hourglass/context';
import HTML from '@hourglass/components/HTML';
import { Editor } from '../ExamCodeBox';

interface CodeProps {
  info: CodeInfo;
  value: CodeState;
  onChange: (newVal: CodeState) => void;
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
  const { fmap } = useExamContext();
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
          {prompt.map((p, i) => (
            <HTML
              // Prompt indices are STATIC.
              // eslint-disable-next-line react/no-array-index-key
              key={i}
              value={p}
            />
          ))}
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
              onChange({
                text: newText,
                marks: newMarks,
              });
            }}
          />
        </Col>
      </Row>
    </>
  );
};
export default Code;
