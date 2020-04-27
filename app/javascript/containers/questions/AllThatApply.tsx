import { connect } from 'react-redux';
import { getAtPath } from '../../store';
import { updateAnswer } from '../../actions';
import { AllThatApply } from '../../components/questions/AllThatApply';

const mapStateToProps = (state, ownProps) => {
  const { qnum, pnum, bnum } = ownProps;
  return {
    value: getAtPath(state, qnum, pnum, bnum),
  }
};

const mapDispatchToProps = (dispatch, ownProps) => {
  const { qnum, pnum, bnum } = ownProps;
  return {
    onChange: (index, newState) => dispatch(
      updateAnswer(
        [qnum, pnum, bnum, index],
        newState,
      )
    ),
  }
};

export default connect(mapStateToProps, mapDispatchToProps)(AllThatApply);
