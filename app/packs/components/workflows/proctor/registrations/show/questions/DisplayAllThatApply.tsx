import React from 'react';
import { AllThatApplyInfo, AllThatApplyState } from '@student/exams/show/types';
import HTML from '@student/exams/show/components/HTML';

interface AllThatApplyProps {
  info: AllThatApplyInfo;
  value?: AllThatApplyState;
}

const DisplayAllThatApply: React.FC<AllThatApplyProps> = (props) => {
  const {
    info,
    value,
  } = props;
  const { options } = info;
  if (!value || !Object.values(value).some((ans) => !!ans)) {
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
      <ul className="answer">
        {options.map((o, i) => {
          // options array is STATIC
          // eslint-disable-next-line react/no-array-index-key
          if (value?.[i]) { return <li key={i}><HTML value={o} /></li>; }
          return null;
        })}
      </ul>
    </>
  );
};

export default DisplayAllThatApply;
