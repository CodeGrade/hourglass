import { connect } from 'react-redux';
import { updateAnswer } from '@hourglass/actions';
import {
  ExamTakerState,
  AnswerState,
  SnapshotStatus,
  MSTP,
  MDTP,
  BodyItem,
} from '@hourglass/types';
import withLocked from '@hourglass/components/Locked';

interface OwnProps {
  info: BodyItem;
  qnum: number;
  pnum: number;
  bnum: number;
}

const mapStateToProps: MSTP<{
  value: AnswerState;
  disabled: boolean;
  locked: boolean;
  lockedMsg: string;
}, OwnProps> = (state: ExamTakerState, ownProps) => {
  const { qnum, pnum, bnum } = ownProps;
  const { snapshot } = state;
  const { status, message } = snapshot;
  const locked = status === SnapshotStatus.FAILURE;
  return {
    value: state.contents.data.answers[qnum]?.[pnum]?.[bnum],
    disabled: locked,
    locked,
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
