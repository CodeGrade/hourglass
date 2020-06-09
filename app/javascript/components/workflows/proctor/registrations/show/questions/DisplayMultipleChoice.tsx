import React from 'react';
import { MultipleChoiceInfo, MultipleChoiceState } from '@student/exams/show/types';
import HTML from '@hourglass/workflows/student/exams/show/components/HTML';

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
          <HTML value={options[value]} />
        </span>
      </>
    );
  }
  return (
    <div>
      <div><HTML value={prompt} /></div>
      {theRest}
    </div>
  );
};

export default DisplayMultipleChoice;
