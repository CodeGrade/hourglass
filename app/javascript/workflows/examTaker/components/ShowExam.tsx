import React from 'react';
import { Provider } from 'react-redux';
import store from '@examTaker/store';
import {
  RailsExam,
  RailsUser,
  RailsRegistration,
} from '@examTaker/types';
import ExamTaker from '@examTaker/containers/ExamTaker';
import ExamSubmitted from '@examTaker/components/ExamSubmitted';
import { RailsContext } from '@examTaker/context';

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
