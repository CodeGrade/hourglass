/* eslint-disable */

import { connect } from 'react-redux';
import { updateAnswer } from '@hourglass/actions';
import {
  ExamTakerState,
  AnswerState,
  StatePath,
  SnapshotStatus,
} from '@hourglass/types';
import withLocked from '@hourglass/components/Locked';

const getAtPath = (state: ExamTakerState, ...path: StatePath): AnswerState => {
  let ret = state.contents.data.answers;
  path.forEach((item) => {
    ret = ret?.[item];
  });
  return ret as AnswerState;
};

const mapStateToProps = (state: ExamTakerState, ownProps) => {
  const { qnum, pnum, bnum } = ownProps;
  const { snapshot } = state;
  const { status, message } = snapshot;
  const locked = status === SnapshotStatus.FAILURE;
  const disabled = status === SnapshotStatus.DISABLED
    || status === SnapshotStatus.FAILURE;
  return {
    value: getAtPath(state, qnum, pnum, bnum),
    disabled,
    locked,
    lockedMsg: message,
  };
};

const mapDispatchToProps = (dispatch, ownProps) => {
  const { qnum, pnum, bnum } = ownProps;
  return {
    onChange: (newState) => dispatch(
      updateAnswer(
        [qnum, pnum, bnum],
        newState,
      ),
    ),
  };
};

export const connectWithPath = (Component) => connect(mapStateToProps, mapDispatchToProps)(withLocked(Component));

const mapDispatchToPropsIndexed = (dispatch, ownProps) => {
  const { qnum, pnum, bnum } = ownProps;
  return {
    onChange: (index, newState) => dispatch(
      updateAnswer(
        [qnum, pnum, bnum, index],
        newState,
      ),
    ),
  };
};

export const connectWithPathIndexed = (Component) => connect(mapStateToProps, mapDispatchToPropsIndexed)(withLocked(Component));
