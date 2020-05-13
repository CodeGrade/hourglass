import React from 'react';
import { MdArrowForward, MdArrowBack } from 'react-icons/md';
import { Button } from 'react-bootstrap';

interface PaginationArrowsProps {
  showBack: boolean;
  showNext: boolean;
  onBack: () => void;
  onNext: () => void;
}

const PaginationArrows: React.FC<PaginationArrowsProps> = (props) => {
  const {
    showBack,
    showNext,
    onBack,
    onNext,
  } = props;
  return (
    <div className="w-100">
      <Button
        disabled={!showBack}
        onClick={onBack}
      >
        <MdArrowBack />
        <span>Previous</span>
      </Button>
      <Button
        disabled={!showNext}
        className="float-right"
        onClick={onNext}
      >
        <span>Next</span>
        <MdArrowForward />
      </Button>
    </div>
  );
};
PaginationArrows.displayName = 'PaginationArrows';

export default PaginationArrows;
