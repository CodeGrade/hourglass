import { connect } from 'react-redux';
import { ExamTakerState } from '@hourglass/types';
import ExamTaker from '@hourglass/components/ExamTaker';

function examTakerStateToProps(state: ExamTakerState) {
  return {
    loaded: state.loaded,
  };
}

export default connect(examTakerStateToProps)(ExamTaker);
