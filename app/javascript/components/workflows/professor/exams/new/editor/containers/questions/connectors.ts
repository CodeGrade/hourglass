import { connect } from 'react-redux';
// import { updateAnswer } from '@professor/exams/new/actions';
import {
  AnswerState,
  BodyItem,
  UpdateAnswerAction,
} from '@student/exams/show/types';
import { MSTP, MDTP, ExamEditorState } from '@professor/exams/new/types';

interface OwnProps {
  info: BodyItem;
  qnum: number;
  pnum: number;
  bnum: number;
}

export function updateAnswer(
  qnum: number,
  pnum: number,
  bnum: number,
  val: AnswerState,
): UpdateAnswerAction {
  return {
    type: 'UPDATE_ANSWER',
    qnum,
    pnum,
    bnum,
    val,
  };
}

const mapStateToProps: MSTP<{
  value: AnswerState;
}, OwnProps> = (state: ExamEditorState, ownProps) => {
  const { qnum, pnum, bnum } = ownProps;
  const { contents } = state;
  return {
    value: contents.answers?.answers?.[qnum]?.[pnum]?.[bnum],
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
export const connectWithPath = (Component) => connect(mapStateToProps, mapDispatchToProps)(Component);
