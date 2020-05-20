import { connect } from 'react-redux';
import { MSTP, LockdownStatus } from '@student/types';
import LockdownInfo from '@student/components/LockdownInfo';

const mapStateToProps: MSTP<{ status: LockdownStatus; message: string }> = (state) => {
  const { lockdown } = state;
  const { status, message } = lockdown;
  return {
    status,
    message,
  };
};

export default connect(mapStateToProps)(LockdownInfo);
