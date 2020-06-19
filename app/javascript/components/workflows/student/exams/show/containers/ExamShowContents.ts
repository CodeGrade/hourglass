import ExamShowContents from '@student/exams/show/components/ExamShowContents';
import { connect } from 'react-redux';
import { saveSnapshot, submitExam } from '@student/exams/show/actions';
import {
  ExamVersion,
  MSTP,
  MDTP,
  RailsExamVersion,
  RailsCourse,
} from '@student/exams/show/types';

interface OwnProps {
  railsCourse: RailsCourse;
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
    dispatch(saveSnapshot(ownProps.railsCourse.id, ownProps.railsExam.id));
  },
  submit: (): void => {
    dispatch(submitExam(ownProps.railsCourse.id, ownProps.railsExam.id));
  },
});

const ExamShowContentsConnected = connect(mapStateToProps, mapDispatchToProps)(ExamShowContents);
ExamShowContentsConnected.displayName = 'ExamShowContentsConnected';
export default ExamShowContentsConnected;
ExamShowContents.whyDidYouRender = true;
