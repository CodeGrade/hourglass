import React from 'react';
import { Form } from 'react-bootstrap';
import { MultipleChoiceInfo, MultipleChoiceState } from '@student/exams/show/types';
import HTML from '@student/exams/show/components/HTML';

interface MultipleChoiceProps {
  info: MultipleChoiceInfo;
  value: MultipleChoiceState;
  onChange: (newVal: number) => void;
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
    onChange(Number(val));
  };
  return (
    <div>
      <HTML value={prompt} />
      <i>(Select one of the following responses)</i>
      <Form.Group>
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
      </Form.Group>
    </div>
  );
};

export default MultipleChoice;
