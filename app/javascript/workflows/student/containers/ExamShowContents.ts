import ExamShowContents from '@student/components/ExamShowContents';
import { connect } from 'react-redux';
import { saveSnapshot } from '@student/actions';
import {
  Exam,
  MSTP,
  MDTP,
  RailsExam,
} from '@student/types';

interface OwnProps {
  railsExam: RailsExam;
}

const mapStateToProps: MSTP<{exam: Exam}, OwnProps> = (state) => ({
  exam: state.contents.exam,
});

const mapDispatchToProps: MDTP<{
  save: () => void;
}, OwnProps> = (dispatch, ownProps) => ({
  save: (): void => {
    dispatch(saveSnapshot(ownProps.railsExam.id));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(ExamShowContents);
