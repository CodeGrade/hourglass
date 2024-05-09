import React, { useRef } from 'react';
import { Button, Alert, Form } from 'react-bootstrap';
import AnomalousMessaging from '@student/exams/show/components/AnomalousMessaging';
import ErrorBoundary from '@hourglass/common/boundary';
import ReadableDate from '@hourglass/common/ReadableDate';
import { DateTime } from 'luxon';
import { useFragment, graphql } from 'react-relay';
import { AllAlerts } from '@hourglass/common/alerts';
import { Policy, policyPermits } from '@student/exams/show/types';

import { PreStart$key } from './__generated__/PreStart.graphql';

interface PreStartProps {
  onClick: (pin?: string) => void;
  isError: boolean;
  errorMsg: string;
  lockdownRequested: boolean,
  policies: readonly Policy[];
  examKey: PreStart$key;
}

const PreStart: React.FC<PreStartProps> = (props) => {
  const {
    onClick,
    isError,
    policies,
    errorMsg,
    examKey,
    lockdownRequested,
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
        policyExemptions
        pinValidated
      }
    }
    `,
    examKey,
  );
  const {
    anomalous,
    over,
    lastSnapshot,
    policyExemptions,
    pinValidated,
  } = res.myRegistration;
  const pinRef = useRef<HTMLInputElement>();
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
  const requirePin = (
    !pinValidated
    && policyPermits(policies, 'STUDENT_PIN')
    && !policyPermits(policyExemptions, 'IGNORE_PIN')
  );
  return (
    <div>
      <h1>{res.name}</h1>
      <Alert variant="warning">
        <div className="text-center"><b><i>Make sure that your window is not maximized right now!</i></b></div>
      </Alert>
      {requirePin && (
        <Form.Group controlId="studentPIN">
          <Form.Label>Enter the PIN supplied by your proctor:</Form.Label>
          <Form.Control type="text" placeholder="PIN" ref={pinRef} />
        </Form.Group>
      )}
      <p>Click the following button to enter secure mode and begin the exam.</p>
      <Button
        variant="success"
        disabled={lockdownRequested}
        onClick={() => onClick(pinRef.current?.value)}
      >
        Begin Exam
      </Button>
      <div>
        {isError && (
          <Alert variant="danger" className="mt-4">
            <p>Error locking down:</p>
            <p><i>{errorMsg}</i></p>
          </Alert>
        )}
      </div>
    </div>
  );
};
export default PreStart;
