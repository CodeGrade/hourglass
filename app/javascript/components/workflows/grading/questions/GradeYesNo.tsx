import React from 'react';
import { YesNoProps } from '@proctor/registrations/show/questions/DisplayYesNo';
import ObjectiveGrade from '@hourglass/workflows/grading/questions/ObjectiveGrade';

const GradeYesNo: React.FC<YesNoProps> = (props) => {
  const {
    info,
    value,
  } = props;
  const {
    yesLabel,
    noLabel,
  } = info;
  if (value === undefined) {
    return (
      <>
        <b>Answer: </b>
        <i>No answer given</i>
        <ObjectiveGrade className="float-right" />
      </>
    );
  }
  return (
    <>
      <b>Answer: </b>
      <span className="btn btn-sm btn-outline-dark disabled">
        {value
          ? yesLabel
          : noLabel}
      </span>
      <ObjectiveGrade className="float-right" />
    </>
  );
};

export default GradeYesNo;
