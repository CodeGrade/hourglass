import React from 'react';
import { YesNoInfo } from '@hourglass/types';

export interface YesNoProps {
  info: YesNoInfo;
  yesLabel?: string;
  noLabel?: string;
  value: boolean;
}

const DisplayYesNo: React.FC<YesNoProps> = (props) => {
  const {
    info,
    yesLabel = 'Yes',
    noLabel = 'No',
    value,
  } = props;
  const { prompt } = info;
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
