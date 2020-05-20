import { connect } from 'react-redux';
import PreStart from '@examTaker/components/PreStart';
import {
  LockdownStatus,
  ExamTakerState,
  MDTP,
  RailsExam,
  MSTP,
} from '@examTaker/types';
import { doTryLockdown } from '@examTaker/actions';

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
