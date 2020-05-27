import { connect } from 'react-redux';
import { submitExam } from '@student/exams/show/actions';
import SubmitButton from '@student/exams/show/components/SubmitButton';
import { MDTP } from '@student/exams/show/types';

interface OwnProps {
  examID: number;
  courseID: number;
}

const mapDispatchToProps: MDTP<{
  submit: () => void;
}, OwnProps> = (dispatch, ownProps) => ({
  submit: (): void => dispatch(submitExam(ownProps.courseID, ownProps.examID)),
});

export default connect(null, mapDispatchToProps)(SubmitButton);
