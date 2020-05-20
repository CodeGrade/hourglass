import React from 'react';
import { AllThatApplyInfo, AllThatApplyState } from '@examTaker/types';

interface AllThatApplyProps {
  info: AllThatApplyInfo;
  value?: AllThatApplyState;
}

const DisplayAllThatApply: React.FC<AllThatApplyProps> = (props) => {
  const {
    info,
    value,
  } = props;
  const { options, prompt } = info;
  let theRest;
  if (!value || !Object.values(value).some((ans) => !!ans)) {
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
        <ul>
          {options.map((o, i) => {
            // options array is STATIC
            // eslint-disable-next-line react/no-array-index-key
            if (value?.[i]) { return <li key={i}>{o}</li>; }
            return null;
          })}
        </ul>
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

export default DisplayAllThatApply;
