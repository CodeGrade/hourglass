import { connect } from 'react-redux';
import { MSTP, ExamMessage } from '@hourglass/types';
import ExamMessages from '@hourglass/components/navbar/ExamMessages';

const mapStateToProps: MSTP<{
  messages: ExamMessage[];
}> = (state) => ({
  messages: state.messages,
});

export default connect(mapStateToProps)(ExamMessages);
