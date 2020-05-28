import React from 'react';
import Part from '@professor/exams/new/editor/containers/Part';

export interface PartsProps {
  qnum: number;
  numParts: number;
}

const ShowParts: React.FC<PartsProps> = (props) => {
  const {
    qnum,
    numParts,
  } = props;
  return (
    <>
      {Array.from(Array(numParts).keys()).map((_, pnum) => (
      // eslint-disable-next-line react/no-array-index-key
        <Part key={pnum} qnum={qnum} pnum={pnum} numParts={numParts} />
      ))}
    </>
  );
};

export default ShowParts;
