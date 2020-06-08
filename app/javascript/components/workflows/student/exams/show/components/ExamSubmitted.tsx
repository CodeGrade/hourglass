import React from 'react';
import { Container } from 'react-bootstrap';
import RegularNavbar from '@hourglass/common/navbar';
import { DateTime } from 'luxon';

const ExamSubmitted: React.FC<{
  lastSnapshot?: DateTime;
}> = (props) => {
  const {
    lastSnapshot,
  } = props;
  const text = lastSnapshot
    ? `Exam submitted at ${lastSnapshot.toLocaleString(DateTime.DATETIME_FULL)}`
    : 'Exam submitted.';
  return (
    <>
      <RegularNavbar />
      <Container>
        <div>
          <i>{text}</i>
        </div>
      </Container>
    </>
  );
};

export default ExamSubmitted;
