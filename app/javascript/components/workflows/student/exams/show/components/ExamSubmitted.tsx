import React from 'react';
import { Container, Alert } from 'react-bootstrap';
import RegularNavbar from '@hourglass/common/navbar';
import { DateTime } from 'luxon';
import { graphql } from 'react-relay';
import { useFragment } from 'relay-hooks';
import ReadableDate from '@hourglass/common/ReadableDate';

import { ExamSubmitted$key } from './__generated__/ExamSubmitted.graphql';

const ExamSubmitted: React.FC<{
  examKey: ExamSubmitted$key;
}> = (props) => {
  const {
    examKey,
  } = props;
  const res = useFragment(
    graphql`
    fragment ExamSubmitted on Exam {
      myRegistration {
        lastSnapshot
      }
    }
    `,
    examKey,
  );
  const { lastSnapshot } = res.myRegistration;
  const parsed = lastSnapshot ? DateTime.fromISO(lastSnapshot) : undefined;
  return (
    <>
      <RegularNavbar />
      <Container>
        <Alert variant="success">
          <div>
            <p>
              <i>You have submitted this exam.</i>
            </p>
            <p>
              {lastSnapshot && (
                <>
                  {'Exam submitted '}
                  <ReadableDate showTime value={parsed} />
                </>
              )}
            </p>
          </div>
        </Alert>
      </Container>
    </>
  );
};

export default ExamSubmitted;
