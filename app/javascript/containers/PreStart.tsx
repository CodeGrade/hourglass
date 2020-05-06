import { connect } from 'react-redux';
import PreStart from '@hourglass/components/PreStart';
import {
  LockdownStatus,
  ExamTakerState,
  MDTP,
  ExamInfo,
  MSTP,
} from '@hourglass/types';
import { doTryLockdown } from '@hourglass/actions';

interface OwnProps {
  exam: ExamInfo;
}

const mapDispatchToProps: MDTP<{
  onClick: () => void;
}, OwnProps> = (dispatch, ownProps) => ({
  onClick: (): void => {
    dispatch(doTryLockdown(ownProps.exam));
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
