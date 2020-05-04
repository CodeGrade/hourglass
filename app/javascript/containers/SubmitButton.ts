import { connect } from 'react-redux';
import { submitExam } from '@hourglass/actions';
import {
  ExamTakerState,
} from '@hourglass/types';
import SubmitButton from '@hourglass/components/SubmitButton';

function mapDispatchToProps(dispatch, ownProps) {
  const { examID } = ownProps;
  return {
    submit: () => dispatch(submitExam(examID)),
  };
}

export default connect(null, mapDispatchToProps)(SubmitButton);
