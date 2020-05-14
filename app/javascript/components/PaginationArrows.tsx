import React from 'react';
import { MdArrowForward, MdArrowBack } from 'react-icons/md';
import { Button } from 'react-bootstrap';

interface PaginationArrowsProps {
  qnumNext?: number;
  pnumNext?: number;
  qnumPrev?: number;
  pnumPrev?: number;
  qnumCurrent: number;
  onChange: (qnum: number, pnum?: number) => void;
}

const PaginationArrows: React.FC<PaginationArrowsProps> = (props) => {
  const {
    qnumNext,
    pnumNext,
    qnumPrev,
    pnumPrev,
    qnumCurrent,
    onChange,
  } = props;
  const prevNoun = pnumPrev === undefined ? 'Question' : 'Part';
  const nextNoun = pnumNext === undefined ? 'Question' : 'Part';
  return (
    <div className="w-100">
      <Button
        disabled={qnumPrev === undefined}
        onClick={(): void => {
          if (pnumPrev !== undefined) {
            onChange(qnumCurrent, pnumPrev);
          } else {
            onChange(qnumPrev, 0);
          }
        }}
      >
        <MdArrowBack />
        <span>
          {`Previous ${prevNoun}`}
        </span>
      </Button>
      <Button
        disabled={qnumNext === undefined}
        className="float-right"
        onClick={(): void => {
          if (pnumNext !== undefined) {
            onChange(qnumCurrent, pnumNext);
          } else {
            onChange(qnumNext, 0);
          }
        }}
      >
        <span>
          {`Next ${nextNoun}`}
        </span>
        <MdArrowForward />
      </Button>
    </div>
  );
};
PaginationArrows.displayName = 'PaginationArrows';

export default PaginationArrows;
