import React, { useContext } from 'react';
import { RailsContext } from '@hourglass/context';
import { Container } from 'react-bootstrap';
import { RegularNavbar } from '@hourglass/components/navbar';

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
