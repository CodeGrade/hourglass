import React, { useContext } from 'react';
import { Button } from 'react-bootstrap';
import { RailsContext } from '@student/exams/show/context';

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
  const {
    railsExam,
    railsRegistration,
  } = useContext(RailsContext);
  if (railsRegistration.anomalous) {
    return (
      <div>
        <h1>{railsExam.name}</h1>
        <i className="text-danger">
          You have been locked out of this exam.
          Please see an instructor.
        </i>
      </div>
    );
  }
  return (
    <div>
      <h1>{railsExam.name}</h1>
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
};
export default PreStart;
