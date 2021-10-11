import React from 'react';
import { MultipleChoiceProps } from '@proctor/registrations/show/questions/DisplayMultipleChoice';
import HTML from '@student/exams/show/components/HTML';

const GradeMultipleChoice: React.FC<MultipleChoiceProps> = (props) => {
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

export default GradeMultipleChoice;
