import ExamShowContents from '@student/exams/show/components/ExamShowContents';
import { connect } from 'react-redux';
import { saveSnapshot, submitExam } from '@student/exams/show/actions';
import {
  ExamVersion,
  MSTP,
  MDTP,
  RailsExamVersion,
} from '@student/exams/show/types';

interface OwnProps {
  railsExam: RailsExamVersion;
}

const mapStateToProps: MSTP<{exam: ExamVersion}, OwnProps> = (state) => ({
  exam: state.contents.exam,
});

const mapDispatchToProps: MDTP<{
  save: () => void;
  submit: () => void;
}, OwnProps> = (dispatch, ownProps) => ({
  save: (): void => {
    dispatch(saveSnapshot(ownProps.railsExam.id));
  },
  submit: (): void => {
    dispatch(submitExam(ownProps.railsExam.id));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(ExamShowContents);
