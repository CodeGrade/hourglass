import React from 'react';
import { YesNoProps } from '@proctor/registrations/show/questions/DisplayYesNo';

const GradeYesNo: React.FC<YesNoProps> = (props) => {
  const {
    info,
    value,
    children,
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
        {children}
      </>
    );
  }
  return (
    <>
      <b>Answer: </b>
      <span className="btn btn-sm btn-outline-dark disabled answer">
        {value
          ? yesLabel
          : noLabel}
      </span>
      {children}
    </>
  );
};

export default GradeYesNo;
