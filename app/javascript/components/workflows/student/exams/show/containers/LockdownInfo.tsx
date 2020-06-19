import { connect } from 'react-redux';
import { MSTP, LockdownStatus } from '@student/exams/show/types';
import LockdownInfo from '@student/exams/show/components/LockdownInfo';

const mapStateToProps: MSTP<{ status: LockdownStatus; message: string }> = (state) => {
  const { lockdown } = state;
  const { status, message } = lockdown;
  return {
    status,
    message,
  };
};

const LockdownInfoConnected = connect(mapStateToProps)(LockdownInfo);
LockdownInfoConnected.displayName = 'LockdownInfoConnected';
export default LockdownInfoConnected;
LockdownInfo.whyDidYouRender = true;
