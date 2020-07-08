import { connect } from 'react-redux';
import { submitExam } from '@student/exams/show/actions';
import SubmitButton from '@student/exams/show/components/SubmitButton';
import { MDTP } from '@student/exams/show/types';

interface OwnProps {
  examTakeUrl: string;
}

const mapDispatchToProps: MDTP<{
  submit: () => void;
}, OwnProps> = (dispatch, ownProps) => ({
  submit: (): void => dispatch(submitExam(ownProps.examTakeUrl)),
});

export default connect(null, mapDispatchToProps)(SubmitButton);
