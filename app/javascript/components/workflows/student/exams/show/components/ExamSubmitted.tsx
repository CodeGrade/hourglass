import React from 'react';
import { Container } from 'react-bootstrap';
import RegularNavbar from '@hourglass/common/navbar';

const ExamSubmitted: React.FC<{}> = () => (
  <>
    <RegularNavbar />
    <Container>
      <div>
        <i>Exam submitted at (TODO)</i>
      </div>
    </Container>
  </>
);

export default ExamSubmitted;
