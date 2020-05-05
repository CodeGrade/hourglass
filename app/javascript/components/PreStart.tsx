import React from 'react';
import { Button } from 'react-bootstrap';

interface PreStartProps {
  onClick: () => void;
  isError: boolean;
  errorMsg?: string;
}

const PreStart: React.FC<PreStartProps> = (props) => {
  const {
    onClick,
    isError,
    errorMsg,
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
      <div>
        {isError && (
          <p className="text-danger">
            Error locking down:
            <i>{errorMsg}</i>
          </p>
        )}
      </div>
    </div>
  );
}
export default PreStart;
