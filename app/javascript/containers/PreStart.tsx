import { connect } from 'react-redux';
import PreStart from '@hourglass/components/PreStart';
import {
  LockdownStatus,
  ExamTakerState,
} from '@hourglass/types';
import { doTryLockdown } from '@hourglass/actions';


const mapDispatchToProps = (dispatch, ownProps) => {
  const {
    exam,
  } = ownProps;
  return {
    onClick: () => {
      dispatch(doTryLockdown(exam, ownProps.preview));
    },
  };
};

const mapStateToProps = (state: ExamTakerState) => ({
  isError: state.lockdown.status === LockdownStatus.FAILED,
  errorMsg: state.lockdown.message,
});

export default connect(mapStateToProps, mapDispatchToProps)(PreStart);
