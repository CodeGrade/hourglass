import React from 'react';
import { Provider } from 'react-redux';
import store from '@student/store';
import {
  RailsExam,
  RailsUser,
  RailsRegistration,
} from '@student/types';
import ExamTaker from '@student/containers/ExamTaker';
import ExamSubmitted from '@student/components/ExamSubmitted';
import { RailsContext } from '@student/context';

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
    railsUser,
    railsExam,
    railsRegistration,
    final,
  } = props;
  return (
    <RailsContext.Provider
      value={{
        railsExam, railsRegistration, railsUser,
      }}
    >
      <Provider store={store}>
        {final ? <ExamSubmitted /> : <ExamTaker />}
      </Provider>
    </RailsContext.Provider>
  );
};

export default ShowExam;
