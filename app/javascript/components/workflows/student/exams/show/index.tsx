import React, { useContext } from 'react';
import { Provider } from 'react-redux';
import { Container } from 'react-bootstrap';
import store from '@student/exams/show/store';
import RegularNavbar from '@hourglass/common/navbar';
import * as ApiStudentExamsShow from '@hourglass/common/api/student/exams/show';
import { useParams } from 'react-router-dom';
import { ExhaustiveSwitchError } from '@hourglass/common/helpers';
import {
  RailsExamVersion,
  RailsUser,
  RailsRegistration,
  RailsCourse,
} from '@student/exams/show/types';
import ExamTaker from '@student/exams/show/containers/ExamTaker';
import ExamSubmitted from '@student/exams/show/components/ExamSubmitted';
import { RailsContext } from '@student/exams/show/context';
import { DateTime } from 'luxon';
import DocumentTitle from '@hourglass/common/documentTitle';

interface ShowExamProps {
  // The current logged-in user.
  railsUser: RailsUser;

  // Information about the exam.
  railsExam: RailsExamVersion;

  // Information about the registration.
  railsRegistration: RailsRegistration;

  // Information about the course.
  railsCourse: RailsCourse;

  // Whether the exam is complete.
  final: boolean;

  lastSnapshot?: DateTime;
}

const Exam: React.FC<ShowExamProps> = (props) => {
  const {
    railsUser,
    railsExam,
    railsRegistration,
    railsCourse,
    final,
    lastSnapshot,
  } = props;
  return (
    <RailsContext.Provider
      value={{
        railsExam,
        railsRegistration,
        railsUser,
        railsCourse,
      }}
    >
      <Provider store={store}>
        {final ? <ExamSubmitted lastSnapshot={lastSnapshot} /> : <ExamTaker />}
      </Provider>
    </RailsContext.Provider>
  );
};

const ShowExam: React.FC = () => {
  const { examId } = useParams();
  const { railsUser } = useContext(RailsContext);
  const showRes = ApiStudentExamsShow.useResponse(examId);
  switch (showRes.type) {
    case 'ERROR':
      return (
        <>
          <RegularNavbar />
          <Container>
            <span className="text-danger">{showRes.text}</span>
          </Container>
        </>
      );
    case 'LOADING':
      return (
        <>
          <RegularNavbar />
          <Container>
            <p>Loading...</p>
          </Container>
        </>
      );
    case 'RESULT':
      return (
        <DocumentTitle title={showRes.response.railsExam.name}>
          <Exam
            railsUser={railsUser}
            railsExam={showRes.response.railsExam}
            railsCourse={showRes.response.railsCourse}
            railsRegistration={showRes.response.railsRegistration}
            final={showRes.response.final}
            lastSnapshot={showRes.response.lastSnapshot}
          />
        </DocumentTitle>
      );
    default:
      throw new ExhaustiveSwitchError(showRes);
  }
};

export default ShowExam;
