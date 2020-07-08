import ExamShowContents from '@student/exams/show/components/ExamShowContents';
import { connect } from 'react-redux';
import { saveSnapshot, submitExam } from '@student/exams/show/actions';
import {
  ExamVersion,
  MSTP,
  MDTP,
} from '@student/exams/show/types';

interface OwnProps {
  examTakeUrl: string;
}

const mapStateToProps: MSTP<{exam: ExamVersion}, OwnProps> = (state) => ({
  exam: state.contents.exam,
});

const mapDispatchToProps: MDTP<{
  save: () => void;
  submit: () => void;
}, OwnProps> = (dispatch, ownProps) => ({
  save: (): void => {
    dispatch(saveSnapshot(ownProps.examTakeUrl));
  },
  submit: (): void => {
    dispatch(submitExam(ownProps.examTakeUrl));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(ExamShowContents);
