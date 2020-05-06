import React from 'react';
import { Form } from 'react-bootstrap';
import { AllThatApplyInfo, AllThatApplyState } from '@hourglass/types';

interface AllThatApplyProps {
  info: AllThatApplyInfo;
  value: AllThatApplyState;
  onChange: (index: number, newState: boolean) => void;
  disabled: boolean;
}

const AllThatApply: React.FC<AllThatApplyProps> = (props) => {
  const {
    onChange,
    info,
    value,
    disabled,
  } = props;
  const { options, prompt } = info;
  // if (readOnly) {
  //   if (!value?.some((ans) => !!ans)) {
  //     theRest = (<React.Fragment>
  //       <b>Answer: </b>
  //       <i>None selected</i>
  //     </React.Fragment>);
  //   } else {
  //     theRest = (<React.Fragment>
  //       <b>Answer: </b>
  //       <ul>
  //         {options.map((o, i) => {
  //           if (value?.[i]) { return <li>{o}</li>; }
  //           else { return null; }
  //         })}
  //       </ul>
  //     </React.Fragment>)
  //   }
  // } else {
  const handler = (index: number) => (event: React.ChangeEvent<HTMLInputElement>): void => {
    const val = event.target.checked;
    onChange(index, val);
  };
  const body = (
    <>
      <i>(Select all that apply)</i>
      {options.map((o, i) => {
        const val = !!value?.[i];
        return (
          <Form.Group key={o}>
            <Form.Check
              disabled={disabled}
              type="checkbox"
              label={o}
              checked={val}
              onChange={handler(i)}
            />
          </Form.Group>
        );
      })}
    </>
  );
  return (
    <div>
      <div>{prompt}</div>
      {body}
    </div>
  );
};

export default AllThatApply;
