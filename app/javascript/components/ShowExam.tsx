import React, { useState, useEffect } from 'react';
import {
  Container,
  Button,
} from 'react-bootstrap';
import { Provider } from 'react-redux';
import store from '@hourglass/store';
import { ExamInfo, User } from '@hourglass/types';
import ExamTaker from '@hourglass/containers/ExamTaker';


interface ShowExamProps {
  // Whether the exam should load in "preview" mode.
  preview: boolean;

  // The current logged-in user.
  user: User;

  // Information about the exam.
  exam: ExamInfo;
}

function ShowExam(props: ShowExamProps) {
  const {
    exam,
    preview,
    user,
  } = props;
  return (
    <Container>
      <Provider store={store}>
        <ExamTaker
          exam={exam}
          preview={preview}
          user={user}
        />
      </Provider>
    </Container>
  );
}

export default ShowExam;
