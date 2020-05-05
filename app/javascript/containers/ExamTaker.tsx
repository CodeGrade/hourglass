import { connect } from 'react-redux';
import {
  ExamTakerState,
  LockdownStatus,
} from '@hourglass/types';
import ExamTaker from '@hourglass/components/ExamTaker';

function examTakerStateToProps(state: ExamTakerState) {
  return {
    ready: state.lockdown.status === LockdownStatus.LOCKED && !!state.contents.data,
  };
}

export default connect(examTakerStateToProps)(ExamTaker);
