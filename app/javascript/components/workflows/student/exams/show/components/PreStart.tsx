import React, { useState, useContext } from 'react';
import { Button, Alert } from 'react-bootstrap';
import AnomalousMessagingContainer from '@student/exams/show/containers/AnomalousMessaging';
import ErrorBoundary from '@hourglass/common/boundary';
import { HitApiError } from '@hourglass/common/types/api';
import ReadableDate from '@hourglass/common/ReadableDate';
import { DateTime } from 'luxon';
import { useFragment, graphql } from 'relay-hooks';
import { PreStart$key } from './__generated__/PreStart.graphql';

const ShowMessaging: React.FC<{
  examQuestionsUrl: string;
  examMessagesUrl: string;
}> = (props) => {
  const {
    examQuestionsUrl,
    examMessagesUrl,
  } = props;
  const [error, setError] = useState<HitApiError>(undefined);
  return (
    <>
      {error && (
        <span className="text-danger">
          <p>Error retrieving questions</p>
          <small>{error.message}</small>
        </span>
      )}
      <AnomalousMessagingContainer
        disabled={!!error}
        onError={setError}
        onSuccess={() => setError(undefined)}
        examQuestionsUrl={examQuestionsUrl}
        examMessagesUrl={examMessagesUrl}
      />
    </>
  );
};


interface PreStartProps {
  onClick: () => void;
  isError: boolean;
  errorMsg?: string;
  examKey: PreStart$key;
}

const PreStart: React.FC<PreStartProps> = (props) => {
  const {
    onClick,
    isError,
    errorMsg,
    examKey,
  } = props;
  const res = useFragment(
    graphql`
    fragment PreStart on Exam {
      name
      messagesUrl
      questionsUrl
      myRegistration {
        anomalous
        over
        lastSnapshot
      }
    }
    `,
    examKey,
  );
  const {
    anomalous,
    over,
    lastSnapshot,
  } = res.myRegistration;
  if (over) {
    const parsed = lastSnapshot ? DateTime.fromISO(lastSnapshot) : undefined;
    return (
      <div>
        <h1>{res.name}</h1>
        <Alert variant="danger">
          <i>
            <p>
              Your exam period is over.
            </p>
            {parsed && (
              <>
                {'Your submission was saved: '}
                <ReadableDate showTime value={parsed} />
              </>
            )}
          </i>
        </Alert>
      </div>
    );
  }
  if (anomalous) {
    return (
      <div>
        <h1>{res.name}</h1>
        <Alert variant="danger">
          <i>
            You have been locked out of this exam.
            Please contact an instructor, either in a message below, in person, or via email.
          </i>
        </Alert>
        <ErrorBoundary>
          <ShowMessaging
            examMessagesUrl={res.messagesUrl}
            examQuestionsUrl={res.questionsUrl}
          />
        </ErrorBoundary>
      </div>
    );
  }
  return (
    <div>
      <h1>{res.name}</h1>
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
