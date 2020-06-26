import React, { useState, useContext } from 'react';
import { Button, Alert } from 'react-bootstrap';
import { RailsContext } from '@student/exams/show/context';
import AnomalousMessagingContainer from '@student/exams/show/containers/AnomalousMessaging';
import ErrorBoundary from '@hourglass/common/boundary';
import { HitApiError } from '@hourglass/common/types/api';

const ShowMessaging: React.FC<{
  examId: number;
}> = ({ examId }) => {
  const [error, setError] = useState<HitApiError>(undefined);
  return (
    <>
      {error && (
        <span className="text-danger">
          <p>{error.name}</p>
          <small>{error.message}</small>
        </span>
      )}
      <AnomalousMessagingContainer
        disabled={!!error}
        examId={examId}
        onError={setError}
        onSuccess={() => setError(undefined)}
      />
    </>
  );
};


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
        <Alert variant="danger">
          <i>
            You have been locked out of this exam.
            Please contact an instructor, either in a message below, in person, or via email.
          </i>
        </Alert>
        <ErrorBoundary>
          <ShowMessaging examId={railsExam.id} />
        </ErrorBoundary>
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
