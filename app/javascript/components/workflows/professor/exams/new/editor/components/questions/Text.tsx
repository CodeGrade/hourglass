import React from 'react';
import {
  Row, Col, Form,
} from 'react-bootstrap';
import { TextInfoWithAnswer } from '@student/exams/show/types';
import Prompted from '@professor/exams/new/editor/components/questions/Prompted';

interface TextProps {
  qnum: number;
  pnum: number;
  bnum: number;
  info: TextInfoWithAnswer;
  onChange: (newInfo: TextInfoWithAnswer) => void;
  disabled?: boolean;
}

const Text: React.FC<TextProps> = (props) => {
  const {
    qnum,
    pnum,
    bnum,
    info,
    onChange,
    disabled = false,
  } = props;
  const { prompt } = info;
  return (
    <>
      {/* <Prompted */}
      {/*   qnum={qnum} */}
      {/*   pnum={pnum} */}
      {/*   bnum={bnum} */}
      {/*   prompt={prompt.value} */}
      {/*   onChange={(newPrompt): void => { */}
      {/*     if (onChange) { onChange({ ...info, prompt: { type: 'HTML', value: newPrompt } }); } */}
      {/*   }} */}
      {/* /> */}
      <Form.Group as={Row} controlId={`${qnum}-${pnum}-${bnum}-prompt`}>
        <Form.Label column sm={2}>Correct answer</Form.Label>
        <Col sm={10}>
          <Form.Control
            disabled={disabled}
            as="textarea"
            rows={3}
            placeholder="Sketch the intended answer here."
            value={info.answer ?? ''}
            onChange={(e): void => {
              const elem = e.target as HTMLTextAreaElement;
              onChange({ ...info, answer: elem.value });
            }}
          />
        </Col>
      </Form.Group>
    </>
  );
};

export default Text;
