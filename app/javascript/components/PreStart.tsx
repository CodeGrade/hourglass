import React from 'react';
import { Button } from 'react-bootstrap';

interface PreStartProps {
  onClick: () => void;
}

const PreStart: React.FC<PreStartProps> = (props) => {
  const {
    onClick,
  } = props;
  return (
    <div>
      <p>Click the following button to enter secure mode and begin the exam.</p>
      <Button
        variant="success"
        onClick={onClick}
      >
        Begin Exam
      </Button>
    </div>
  );
}
export default PreStart;
