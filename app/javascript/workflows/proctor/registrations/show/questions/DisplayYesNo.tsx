import React from 'react';
import { YesNoInfo } from '@student/types';

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
    yesLabel = 'Yes',
    noLabel = 'No',
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
          {value ? yesLabel : noLabel}
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

export default DisplayYesNo;
