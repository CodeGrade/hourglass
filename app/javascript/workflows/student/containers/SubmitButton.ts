import { connect } from 'react-redux';
import { submitExam } from '@student/actions';
import SubmitButton from '@student/components/SubmitButton';
import { MDTP } from '@student/types';

interface OwnProps {
  examID: number;
}

const mapDispatchToProps: MDTP<{
  submit: () => void;
}, OwnProps> = (dispatch, ownProps) => ({
  submit: (): void => dispatch(submitExam(ownProps.examID)),
});

export default connect(null, mapDispatchToProps)(SubmitButton);
