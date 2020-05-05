import { connect } from 'react-redux';
import { submitExam } from '@hourglass/actions';
import SubmitButton from '@hourglass/components/SubmitButton';
import { MDTP } from '@hourglass/types';

interface OwnProps {
  examID: number;
}

const mapDispatchToProps: MDTP<{
  submit: () => void;
}, OwnProps> = (dispatch, ownProps) => ({
  submit: (): void => dispatch(submitExam(ownProps.examID)),
});

export default connect(null, mapDispatchToProps)(SubmitButton);
