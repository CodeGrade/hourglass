import React from 'react';
import { MdArrowForward, MdArrowBack } from 'react-icons/md';
import { Button } from 'react-bootstrap';

interface PaginationArrowsProps {
  show: boolean;
  hasNext: boolean;
  hasPrev: boolean;
  next: () => void;
  prev: () => void;
}

const PaginationArrows: React.FC<PaginationArrowsProps> = (props) => {
  const {
    show,
    hasNext,
    hasPrev,
    next,
    prev,
  } = props;
  return (
    <div
      className={show ? 'w-100' : 'd-none'}
    >
      <Button
        className={hasPrev ? '' : 'd-none'}
        onClick={prev}
      >
        <MdArrowBack />
        <span>
          Previous
        </span>
      </Button>
      <Button
        className={hasNext ? 'float-right' : 'd-none'}
        onClick={next}
      >
        <span>
          Next
        </span>
        <MdArrowForward />
      </Button>
    </div>
  );
};
PaginationArrows.displayName = 'PaginationArrows';

export default PaginationArrows;
