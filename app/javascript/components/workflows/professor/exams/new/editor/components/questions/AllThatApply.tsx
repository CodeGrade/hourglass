import React from 'react';
import { Form, Row, Col } from 'react-bootstrap';
import { AllThatApplyInfo, AllThatApplyState } from '@student/exams/show/types';
import Prompted from '@professor/exams/new/editor/components/questions/Prompted';

interface AllThatApplyProps {
  info: AllThatApplyInfo;
  value: AllThatApplyState;
  onChange: (newInfo: AllThatApplyInfo, newVal: AllThatApplyState) => void;
  disabled: boolean;
  qnum: number;
  pnum: number;
  bnum: number;
}

const AllThatApply: React.FC<AllThatApplyProps> = (props) => {
  const {
    onChange,
    info,
    value,
    disabled,
    qnum,
    pnum,
    bnum,
  } = props;
  const { options, prompt } = info;

  const handler = (index: number) => (event: React.ChangeEvent<HTMLInputElement>): void => {
    const val = event.target.checked;
    const ret = { ...value };
    ret[index] = val;
    onChange(info, ret);
  };
  const body = (
    <Form.Group as={Row} controlId={`${qnum}-${pnum}-${bnum}-answer`}>
      <Form.Label column sm={2}>Correct answers</Form.Label>
      <Col sm={10}>
        {options.map((o, i) => {
          const val = !!value?.[i];
          return (
            <Form.Group key={o}>
              <Form.Check
                disabled={disabled}
                type="checkbox"
                label={o}
                checked={val}
                id={`ata-${qnum}-${pnum}-${bnum}-${i}`}
                onChange={handler(i)}
              />
            </Form.Group>
          );
        })}
      </Col>
    </Form.Group>
  );
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
      {body}
    </>
  );
};

export default AllThatApply;
