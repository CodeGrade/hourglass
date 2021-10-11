import React from 'react';
import { YesNoInfo } from '@student/exams/show/types';

export interface YesNoProps {
  info: YesNoInfo;
  value: boolean;
}

const DisplayYesNo: React.FC<YesNoProps> = (props) => {
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
    </>
  );
};

export default DisplayYesNo;
