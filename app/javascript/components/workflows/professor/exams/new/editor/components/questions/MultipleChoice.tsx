import React from 'react';
import { Row, Col, Form } from 'react-bootstrap';
import { MultipleChoiceInfo, MultipleChoiceState } from '@student/exams/show/types';
import Prompted from '@professor/exams/new/editor/components/questions/Prompted';
import HTML from '@student/exams/show/components/HTML';

interface MultipleChoiceProps {
  info: MultipleChoiceInfo;
  value: MultipleChoiceState;
  onChange: (newInfo: MultipleChoiceInfo, newVal: number) => void;
  disabled: boolean;
  qnum: number;
  pnum: number;
  bnum: number;
}

const MultipleChoice: React.FC<MultipleChoiceProps> = (props) => {
  const {
    info,
    value,
    onChange,
    disabled,
    qnum,
    pnum,
    bnum,
  } = props;
  const { options, prompt } = info;
  const handler = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const val = event.target.value;
    onChange(info, Number(val));
  };
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
      <Form.Group as={Row} controlId={`${qnum}-${pnum}-${bnum}-answer`}>
        <Form.Label column sm={2}>Correct answer</Form.Label>
        <Col sm={10}>
          {options.map((option, idx) => (
            <Form.Check
              disabled={disabled}
              type="radio"
              value={idx}
              label={<HTML value={option} />}
              onChange={handler}
              checked={value === idx}
              id={`opt-${qnum}-${pnum}-${bnum}-${idx}`}
              // Response indices are STATIC.
              // eslint-disable-next-line react/no-array-index-key
              key={idx}
            />
          ))}
        </Col>
      </Form.Group>
    </>
  );
};

export default MultipleChoice;
