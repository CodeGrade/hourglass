import ExamShowContents from '@hourglass/components/ExamShowContents';
import { connect } from 'react-redux';
import { saveSnapshot } from '@hourglass/actions';
import {
  ExamTakerState,
} from '@hourglass/types';

function mapStateToProps(state: ExamTakerState) {
  return {
    examState: state.contents.data.exam,
  };
}

function mapDispatchToProps(dispatch, ownProps) {
  return {
    save: (examID) => {
      dispatch(saveSnapshot(ownProps.exam.id));
    },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(ExamShowContents);
