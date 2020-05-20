import { connect } from 'react-redux';
import {
  LockdownStatus,
  MSTP,
} from '@examTaker/types';
import ExamTaker from '@examTaker/components/ExamTaker';

const examTakerStateToProps: MSTP<{ ready: boolean }> = (state) => ({
  ready: (state.lockdown.status === LockdownStatus.LOCKED
          || state.lockdown.status === LockdownStatus.IGNORED)
         && !!state.lockdown.loaded,
});

export default connect(examTakerStateToProps)(ExamTaker);
