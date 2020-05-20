import React, { useContext } from 'react';
import { RailsContext } from '@student/context';
import { Container } from 'react-bootstrap';
import { RegularNavbar } from '@student/components/navbar';

const ExamSubmitted: React.FC<{}> = () => {
  const {
    railsUser,
  } = useContext(RailsContext);
  return (
    <>
      <RegularNavbar
        railsUser={railsUser}
      />
      <Container>
        <div>
          <i>Exam submitted at (TODO)</i>
        </div>
      </Container>
    </>
  );
};

export default ExamSubmitted;
