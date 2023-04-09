import { connect } from 'react-redux';
import PreStart from '@student/exams/show/components/PreStart';
import {
  LockdownStatus,
  ExamTakerState,
  MDTP,
  MSTP,
  Policy,
  PolicyExemption,
} from '@student/exams/show/types';
import { doTryLockdown } from '@student/exams/show/actions';

interface OwnProps {
  policies: readonly Policy[];
  policyExemptions: readonly PolicyExemption[],
  examTakeUrl: string;
}

const mapDispatchToProps: MDTP<{
  onClick: (pin?: string) => void;
}, OwnProps> = (dispatch, ownProps) => ({
  onClick: (pin?: string): void => {
    dispatch(doTryLockdown(
      ownProps.policies,
      ownProps.policyExemptions,
      ownProps.examTakeUrl,
      pin,
    ));
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
