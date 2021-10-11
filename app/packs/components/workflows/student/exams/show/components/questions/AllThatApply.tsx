import React from 'react';
import { Form } from 'react-bootstrap';
import { AllThatApplyInfo, AllThatApplyState } from '@student/exams/show/types';
import HTML from '@student/exams/show/components/HTML';

interface AllThatApplyProps {
  info: AllThatApplyInfo;
  value: AllThatApplyState;
  onChange: (newVal: AllThatApplyState) => void;
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
    onChange(ret);
  };
  const body = (
    <>
      <i>(Select all that apply)</i>
      {options.map((o, i) => {
        const val = !!value?.[i];
        return (
          <Form.Group key={o.value}>
            <Form.Check
              disabled={disabled}
              type="checkbox"
              label={<HTML value={o} />}
              checked={val}
              id={`ata-${qnum}-${pnum}-${bnum}-${i}`}
              onChange={handler(i)}
            />
          </Form.Group>
        );
      })}
    </>
  );
  return (
    <div>
      <HTML value={prompt} />
      {body}
    </div>
  );
};

export default AllThatApply;
