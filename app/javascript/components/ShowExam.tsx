import React, { useState, useEffect } from 'react';
import {
  Row,
  Col,
  Container,
  Button,
} from 'react-bootstrap';
import { Provider } from 'react-redux';
import store from '@hourglass/store';
import { ExamInfo, User } from '@hourglass/types';
import ExamTaker from '@hourglass/containers/ExamTaker';
import ExamViewer from '@hourglass/components/ExamViewer';

interface ShowExamProps {
  // Whether the exam should load in "preview" mode.
  preview: boolean;

  // The current logged-in user.
  user: User;

  // Information about the exam.
  exam: ExamInfo;

  // Whether the exam is complete.
  final: boolean;
}

function ShowExam(props: ShowExamProps) {
  const {
    exam,
    preview,
    user,
    final,
  } = props;
  return (
    <Container>
      <Provider store={store}>
        <Row>
          <Col>
            <h1>{exam.name}</h1>
            {final
            ? (
              <ExamViewer />
            )
            : (
              <ExamTaker
                exam={exam}
                preview={preview}
                user={user}
              />
            )}
          </Col>
        </Row>
      </Provider>
    </Container>
  );
}

export default ShowExam;
