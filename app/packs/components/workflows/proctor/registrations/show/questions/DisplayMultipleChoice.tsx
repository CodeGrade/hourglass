import React from 'react';
import { MultipleChoiceInfo, MultipleChoiceState } from '@student/exams/show/types';
import HTML from '@student/exams/show/components/HTML';

export interface MultipleChoiceProps {
  info: MultipleChoiceInfo;
  value: MultipleChoiceState;
}

const DisplayMultipleChoice: React.FC<MultipleChoiceProps> = (props) => {
  const {
    info,
    value,
  } = props;
  const { options } = info;
  if (value === undefined) {
    return (
      <>
        <b>Answer: </b>
        <i>None selected</i>
      </>
    );
  }
  return (
    <>
      <b>Answer: </b>
      <span className="btn btn-sm btn-outline-dark disabled answer">
        <HTML value={options[value]} />
      </span>
    </>
  );
};

export default DisplayMultipleChoice;
