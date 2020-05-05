import { connect } from 'react-redux';
import { ExamTakerState } from '@hourglass/types';
import LockdownInfo from '@hourglass/components/LockdownInfo';

function mapStateToProps(state: ExamTakerState) {
  const { lockdown } = state;
  const { status, message } = lockdown;
  return {
    status,
    message,
  };
}

export default connect(mapStateToProps)(LockdownInfo);
