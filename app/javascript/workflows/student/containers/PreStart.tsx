import { connect } from 'react-redux';
import PreStart from '@student/components/PreStart';
import {
  LockdownStatus,
  ExamTakerState,
  MDTP,
  RailsExam,
  MSTP,
} from '@student/types';
import { doTryLockdown } from '@student/actions';

interface OwnProps {
  railsExam: RailsExam;
}

const mapDispatchToProps: MDTP<{
  onClick: () => void;
}, OwnProps> = (dispatch, ownProps) => ({
  onClick: (): void => {
    dispatch(doTryLockdown(ownProps.railsExam));
  },
});

const mapStateToProps: MSTP<{
  isError: boolean;
  errorMsg: string;
}, OwnProps> = (state: ExamTakerState) => ({
  isError: state.lockdown.status === LockdownStatus.FAILED,
  errorMsg: state.lockdown.message,
});

export default connect(mapStateToProps, mapDispatchToProps)(PreStart);
