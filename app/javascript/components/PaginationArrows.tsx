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
  const showPrev = qnumPrev !== undefined || pnumPrev !== undefined;
  const showNext = qnumNext !== undefined || pnumNext !== undefined;
  return (
    <div className="w-100">
      <Button
        className={showPrev ? '' : 'd-none'}
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
        className={showNext ? 'float-right' : 'd-none'}
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
