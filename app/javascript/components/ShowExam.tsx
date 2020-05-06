import React from 'react';
import {
  Row,
  Col,
  Container,
} from 'react-bootstrap';
import { Provider } from 'react-redux';
import store from '@hourglass/store';
import {
  RailsExam,
  RailsUser,
  RailsRegistration,
} from '@hourglass/types';
import ExamTaker from '@hourglass/containers/ExamTaker';
import ExamSubmitted from '@hourglass/components/ExamSubmitted';
import { ExamInfoContextProvider } from '@hourglass/context';

interface ShowExamProps {
  // The current logged-in user.
  railsUser: RailsUser;

  // Information about the exam.
  railsExam: RailsExam;

  // Information about the registration.
  railsRegistration: RailsRegistration;

  // Whether the exam is complete.
  final: boolean;
}

const ShowExam: React.FC<ShowExamProps> = (props) => {
  const {
    railsExam,
    railsUser,
    final,
    railsRegistration,
  } = props;
  return (
    <Container>
      <ExamInfoContextProvider value={{
        railsExam, railsRegistration, railsUser,
      }}
      >
        <Provider store={store}>
          <Row>
            <Col>
              <h1>{railsExam.name}</h1>
              {final ? <ExamSubmitted /> : <ExamTaker />}
            </Col>
          </Row>
        </Provider>
      </ExamInfoContextProvider>
    </Container>
  );
};

export default ShowExam;
