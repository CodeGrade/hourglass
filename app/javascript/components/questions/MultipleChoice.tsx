import React from 'react';
import { Form } from 'react-bootstrap';
import { MultipleChoice, MultipleChoiceState } from '../../types';

interface MultipleChoiceProps {
  info: MultipleChoice;
  value: MultipleChoiceState,
  onChange: (newVal: number) => void;
}

export function MultipleChoice(props: MultipleChoiceProps) {
  const { info, value, onChange } = props;
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
  const handler = (event) => {
    const val = event.target.value;
    onChange(val);
  };
  return (
    <div>
      <div>{prompt}</div>
      <i>(Select one of the following responses)</i>
      <Form.Group>
        {options.map((option, idx) => (
          <Form.Check
            type="radio"
            value={idx}
            label={option}
            onChange={handler}
            checked={value == idx}
            key={idx}
          />
        ))}
      </Form.Group>
    </div>
  );
}
