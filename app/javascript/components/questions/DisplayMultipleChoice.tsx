import React from 'react';
import { MultipleChoiceInfo, MultipleChoiceState } from '@hourglass/types';

interface MultipleChoiceProps {
  info: MultipleChoiceInfo;
  value: MultipleChoiceState;
}

const DisplayMultipleChoice: React.FC<MultipleChoiceProps> = (props) => {
  const {
    info,
    value,
  } = props;
  const { options, prompt } = info;
  let theRest;
  if (value === undefined) {
    theRest = (
      <>
        <b>Answer: </b>
        <i>None selected</i>
      </>
    );
  } else {
    theRest = (
      <>
        <b>Answer: </b>
        <span className="btn btn-sm btn-outline-dark disabled">
          {options[value]}
        </span>
      </>
    );
  }
  return (
    <div>
      <div>{prompt}</div>
      {theRest}
    </div>
  );
};

export default DisplayMultipleChoice;
