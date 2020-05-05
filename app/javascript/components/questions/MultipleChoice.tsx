import React from 'react';
import { Form } from 'react-bootstrap';
import { MultipleChoiceInfo, MultipleChoiceState } from '@hourglass/types';

interface MultipleChoiceProps {
  info: MultipleChoiceInfo;
  value: MultipleChoiceState;
  onChange: (newVal: number) => void;
  disabled: boolean;
}

const MultipleChoice: React.FC<MultipleChoiceProps> = (props) => {
  const {
    info,
    value,
    onChange,
    disabled,
  } = props;
  const { options, prompt } = info;
  // if (readOnly) {
  //  if (value === undefined) {
  //    theRest = (<React.Fragment>
  //      <b>Answer: </b>
  //      <i>None selected</i>
  //    </React.Fragment>);
  //  } else {
  //    theRest = (<React.Fragment>
  //      <b>Answer: </b>
  //      <span className="btn btn-sm btn-outline-dark disabled">
  //        {options[value]}
  //      </span>

  //    </React.Fragment>)
  //  }
  // } else {
  const handler = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const val = event.target.value;
    onChange(Number(val));
  };
  return (
    <div>
      <div>{prompt}</div>
      <i>(Select one of the following responses)</i>
      <Form.Group>
        {options.map((option, idx) => (
          <Form.Check
            disabled={disabled}
            type="radio"
            value={idx}
            label={option}
            onChange={handler}
            checked={value === idx}
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
