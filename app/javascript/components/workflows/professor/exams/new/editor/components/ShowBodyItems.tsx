import React from 'react';
import BodyItem from '@professor/exams/new/editor/containers/BodyItem';

export interface BodyItemsProps {
  qnum: number;
  pnum: number;
  numBodyItems: number;
}

const ShowBodyItems: React.FC<BodyItemsProps> = (props) => {
  const {
    qnum,
    pnum,
    numBodyItems,
  } = props;
  return (
    <>
      {Array.from(Array(numBodyItems).keys()).map((_, bnum) => (
      // eslint-disable-next-line react/no-array-index-key
        <BodyItem key={bnum} qnum={qnum} pnum={pnum} bnum={bnum} numBodyItems={numBodyItems} />
      ))}
    </>
  );
};

export default ShowBodyItems;
