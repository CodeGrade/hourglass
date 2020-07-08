import { connect } from 'react-redux';
import PreStart from '@student/exams/show/components/PreStart';
import {
  LockdownStatus,
  ExamTakerState,
  MDTP,
  MSTP,
  Policy,
} from '@student/exams/show/types';
import { doTryLockdown } from '@student/exams/show/actions';

interface OwnProps {
  policies: readonly Policy[];
  examTakeUrl: string;
}

const mapDispatchToProps: MDTP<{
  onClick: () => void;
}, OwnProps> = (dispatch, ownProps) => ({
  onClick: (): void => {
    dispatch(doTryLockdown(ownProps.policies, ownProps.examTakeUrl));
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
