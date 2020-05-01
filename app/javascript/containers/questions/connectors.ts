import { connect } from 'react-redux';
import { getAtPath } from '@hourglass/store';
import { updateAnswer } from '@hourglass/actions';
import { ExamState, SnapshotStatus } from '@hourglass/types';
import withLocked from '@hourglass/components/Locked';

const mapStateToProps = (state: ExamState, ownProps) => {
  const { qnum, pnum, bnum } = ownProps;
  const { snapshot } = state;
  const { status, message } = snapshot;
  const locked = status == SnapshotStatus.FAILURE;
  return {
    value: getAtPath(state, qnum, pnum, bnum),
    disabled: status == SnapshotStatus.DISABLED || locked,
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

export const connectWithPath = (Component) =>
  connect(mapStateToProps, mapDispatchToProps)(withLocked(Component));

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

export const connectWithPathIndexed = (Component) =>
  connect(mapStateToProps, mapDispatchToPropsIndexed)(withLocked(Component));
