import { connect } from 'react-redux';
import { updateAnswer } from '@student/exams/show/actions';
import {
  ExamTakerState,
  AnswerState,
  NoAnswerState,
  SnapshotStatus,
  MSTP,
  MDTP,
  BodyItemInfo,
} from '@student/exams/show/types';
import withLocked from '@student/exams/show/components/Locked';

interface OwnProps {
  info: BodyItemInfo;
  qnum: number;
  pnum: number;
  bnum: number;
}

export const isNoAns = (answer: AnswerState): boolean => (
  (answer instanceof Object) && (answer as NoAnswerState).NO_ANS
);

const mapStateToProps: MSTP<{
  value: AnswerState;
  disabled: boolean;
  locked: boolean;
  examFinished: boolean;
  lockedMsg: string;
}, OwnProps> = (state: ExamTakerState, ownProps) => {
  const { qnum, pnum, bnum } = ownProps;
  const { snapshot } = state;
  const { status, message } = snapshot;
  const locked = (status === SnapshotStatus.FAILURE);
  const examFinished = (status === SnapshotStatus.FINISHED);
  const answer = state.contents.answers.answers[qnum][pnum][bnum];
  return {
    value: isNoAns(answer) ? undefined : answer,
    disabled: locked,
    locked,
    examFinished,
    lockedMsg: message,
  };
};

const mapDispatchToProps: MDTP<{
  onChange: (newState: AnswerState) => void;
}, OwnProps> = (dispatch, ownProps) => {
  const { qnum, pnum, bnum } = ownProps;
  return {
    onChange: (newState: AnswerState): void => {
      dispatch(
        updateAnswer(
          qnum,
          pnum,
          bnum,
          newState,
        ),
      );
    },
  };
};

// eslint-disable-next-line
export const connectWithPath = (Component) => connect(mapStateToProps, mapDispatchToProps)(withLocked(Component));
