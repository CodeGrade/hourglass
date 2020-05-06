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
  RegistrationInfo,
} from '@hourglass/types';
import ExamTaker from '@hourglass/containers/ExamTaker';
import ExamSubmitted from '@hourglass/components/ExamSubmitted';
import { ExamInfoContextProvider } from '@hourglass/context';

interface ShowExamProps {
  // The current logged-in user.
  user: RailsUser;

  // Information about the exam.
  exam: RailsExam;

  // Information about the registration.
  registration: RegistrationInfo;

  // Whether the exam is complete.
  final: boolean;
}

const ShowExam: React.FC<ShowExamProps> = (props) => {
  const {
    exam,
    user,
    final,
    registration,
  } = props;
  return (
    <Container>
      <ExamInfoContextProvider value={{
        exam, registration, user,
      }}
      >
        <Provider store={store}>
          <Row>
            <Col>
              <h1>{exam.name}</h1>
              {final ? <ExamSubmitted /> : <ExamTaker />}
            </Col>
          </Row>
        </Provider>
      </ExamInfoContextProvider>
    </Container>
  );
};

export default ShowExam;
