import { connect } from 'react-redux';
import { MDTP } from '@student/exams/show/types';
import AnomalousMessaging from '@student/exams/show/components/AnomalousMessaging';
import { loadMessages } from '@student/exams/show/actions';

interface OwnProps {
  examId: number;
}

const mapDispatchToProps: MDTP<{
  refreshMessages: () => void;
}, OwnProps> = (dispatch, ownProps) => ({
  refreshMessages: () => {
    dispatch(loadMessages(ownProps.examId));
  },
});

export default connect(null, mapDispatchToProps)(AnomalousMessaging);
