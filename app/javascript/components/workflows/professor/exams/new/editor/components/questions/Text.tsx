import React from 'react';
import {
  Row, Col, Form,
} from 'react-bootstrap';
import { TextInfo, TextState } from '@student/exams/show/types';
import Prompted from '@professor/exams/new/editor/components/questions/Prompted';

interface TextProps {
  qnum: number;
  pnum: number;
  bnum: number;
  info: TextInfo;
  value: TextState;
  onChange: (newInfo: TextInfo, newVal: TextState) => void;
  disabled: boolean;
}

const Text: React.FC<TextProps> = (props) => {
  const {
    qnum,
    pnum,
    bnum,
    info,
    value,
    onChange,
    disabled,
  } = props;
  const { prompt } = info;
  return (
    <>
      <Prompted
        qnum={qnum}
        pnum={pnum}
        bnum={bnum}
        prompt={prompt}
        onChange={(newPrompt): void => {
          if (onChange) { onChange({ ...info, prompt: newPrompt }, value); }
        }}
      />
      <Form.Group as={Row} controlId={`${qnum}-${pnum}-${bnum}-prompt`}>
        <Form.Label column sm={2}>Correct answer</Form.Label>
        <Col sm={10}>
          <Form.Control
            disabled={disabled}
            as="textarea"
            rows={3}
            placeholder="Sketch the intended answer here."
            value={value ?? ''}
            onChange={(e): void => {
              const elem = e.target as HTMLTextAreaElement;
              onChange(info, elem.value);
            }}
          />
        </Col>
      </Form.Group>
    </>
  );
};

export default Text;
