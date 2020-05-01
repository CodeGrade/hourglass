import React, { useState, useEffect } from 'react';
import {
  Container,
  Button,
} from 'react-bootstrap';
import { connect, Provider } from 'react-redux';
import store from '@hourglass/store';
import { fetchContents } from '@hourglass/actions';
import { ExamTakerState, ExamInfo, User } from '@hourglass/types';
import { ExamContextProvider } from '@hourglass/context';
import { createMap } from '@hourglass/files';
import {
  ExamNavbar,
  RegularNavbar,
} from '@hourglass/components/navbar';
import ExamShowContents from '@hourglass/containers/ExamShowContents';

interface PreStartProps {
  onClick: () => void;
}

const PreStart: React.FC<PreStartProps> = (props) => {
  const {
    onClick,
  } = props;
  return (
    <div>
      <p>Click the following button to enter secure mode and begin the exam.</p>
      <Button
        variant="success"
        onClick={onClick}
      >
        Begin Exam
      </Button>
    </div>
  );
}

const mapPreStartDispatch = (dispatch, ownProps) => {
  const { examID } = ownProps;
  return {
    onClick: () => {
      dispatch(fetchContents(examID));
    },
  };
}

const PreStartContainer = connect(null, mapPreStartDispatch)(PreStart);

interface ExamTakerProps {
  loaded: boolean;
  exam: ExamInfo;
  preview: boolean;
  user: User;
}

function ExamTaker(props: ExamTakerProps) {
  const {
    loaded,
    exam,
    preview,
    user,
  } = props;
  if (loaded) {
    return (
      <div>
        <ExamNavbar
          user={user}
          preview={preview}
          locked={loaded}
        />
        <ExamShowContents exam={exam} />
      </div>
    );
  }
  return (
    <div>
      <RegularNavbar user={user} />
      <h1>{exam.name}</h1>
      <PreStartContainer
        examID={exam.id}
      />
    </div>
  );
}

function examTakerStateToProps(state: ExamTakerState) {
  return {
    loaded: state.loaded,
  };
}

const ExamTakerContainer = connect(examTakerStateToProps)(ExamTaker);

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
        <ExamTakerContainer
          exam={exam}
          preview={preview}
          user={user}
        />
      </Provider>
    </Container>
  );
}

export default ShowExam;
