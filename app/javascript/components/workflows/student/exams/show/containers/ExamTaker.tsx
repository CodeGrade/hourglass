import { connect } from 'react-redux';
import {
  LockdownStatus,
  MSTP,
} from '@student/exams/show/types';
import ExamTaker from '@student/exams/show/components/ExamTaker';

const examTakerStateToProps: MSTP<{ ready: boolean }> = (state) => ({
  ready: (state.lockdown.status === LockdownStatus.LOCKED
          || state.lockdown.status === LockdownStatus.IGNORED)
         && !!state.lockdown.loaded,
});

const ExamTakerConnected = connect(examTakerStateToProps)(ExamTaker);
ExamTakerConnected.displayName = 'ExamTakerConnected';
export default ExamTakerConnected;
ExamTaker.whyDidYouRender = true;
