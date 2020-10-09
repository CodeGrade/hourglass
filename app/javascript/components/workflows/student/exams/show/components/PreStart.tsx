import React from 'react';
import { Button, Alert } from 'react-bootstrap';
import AnomalousMessaging from '@student/exams/show/components/AnomalousMessaging';
import ErrorBoundary from '@hourglass/common/boundary';
import ReadableDate from '@hourglass/common/ReadableDate';
import { DateTime } from 'luxon';
import { useFragment, graphql } from 'relay-hooks';
import { AllAlerts } from '@hourglass/common/alerts';

import { PreStart$key } from './__generated__/PreStart.graphql';

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
      ...AnomalousMessaging
      name
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
          <p>
            <i>Your exam period is over.</i>
          </p>
          {parsed ? (
            <p>
              <i>{'Your submission was saved: '}</i>
              <ReadableDate showTime value={parsed} />
            </p>
          ) : (
            <p>
              <b>
                <i>
                  You have no submissions for this exam.
                  If this is in error, contact a professor.
                </i>
              </b>
            </p>
          )}
        </Alert>
      </div>
    );
  }
  if (anomalous) {
    return (
      <AllAlerts>
        <div>
          <h1>{res.name}</h1>
          <Alert variant="danger">
            <i>
              You have been locked out of this exam.
              Please contact an instructor, either in a message below, in person, or via email.
            </i>
          </Alert>
          <ErrorBoundary>
            <AnomalousMessaging examKey={res} />
          </ErrorBoundary>
        </div>
      </AllAlerts>
    );
  }
  return (
    <div>
      <h1>{res.name}</h1>
      <Alert variant="warning">
        <div className="text-center"><b><i>Make sure that your window is not maximized right now!</i></b></div>
      </Alert>
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
