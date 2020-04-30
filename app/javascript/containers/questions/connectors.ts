import { connect } from 'react-redux';
import { getAtPath } from '../../store';
import { updateAnswer } from '../../actions';
import { ExamState } from '../../types';

const mapStateToProps = (state: ExamState, ownProps) => {
  const { qnum, pnum, bnum } = ownProps;
  const { snapshot } = state;
  return {
    value: getAtPath(state, qnum, pnum, bnum),
    disabled: snapshot.disableControls,
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

export const connectWithPath = connect(mapStateToProps, mapDispatchToProps);

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

export const connectWithPathIndexed = connect(mapStateToProps, mapDispatchToPropsIndexed);
