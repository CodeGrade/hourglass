import { connect } from 'react-redux';
import { getAtPath } from '../../store';
import { updateAnswer } from '../../actions';

const mapStateToProps = (state, ownProps) => {
  const { qnum, pnum, bnum } = ownProps;
  return {
    value: getAtPath(state, qnum, pnum, bnum),
  }
};

const mapDispatchToProps = (dispatch, ownProps) => {
  const { qnum, pnum, bnum } = ownProps;
  return {
    onChange: (newState) => dispatch(
      updateAnswer(
        [qnum, pnum, bnum],
        newState,
      )
    ),
  }
};

export const connectWithPath = connect(mapStateToProps, mapDispatchToProps);
