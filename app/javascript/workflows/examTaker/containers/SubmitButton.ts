import { connect } from 'react-redux';
import { submitExam } from '@examTaker/actions';
import SubmitButton from '@examTaker/components/SubmitButton';
import { MDTP } from '@examTaker/types';

interface OwnProps {
  examID: number;
}

const mapDispatchToProps: MDTP<{
  submit: () => void;
}, OwnProps> = (dispatch, ownProps) => ({
  submit: (): void => dispatch(submitExam(ownProps.examID)),
});

export default connect(null, mapDispatchToProps)(SubmitButton);
