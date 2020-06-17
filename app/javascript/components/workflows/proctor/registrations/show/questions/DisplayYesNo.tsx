import React from 'react';
import { YesNoInfo } from '@student/exams/show/types';
import HTML from '@hourglass/workflows/student/exams/show/components/HTML';

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
    prompt,
    yesLabel,
    noLabel,
  } = info;
  let theRest;
  if (value === undefined) {
    theRest = (
      <>
        <b>Answer: </b>
        <i>No answer given</i>
      </>
    );
  } else {
    theRest = (
      <>
        <b>Answer: </b>
        <span className="btn btn-sm btn-outline-dark disabled">
          {value
            ? yesLabel
            : noLabel}
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

export default DisplayYesNo;
