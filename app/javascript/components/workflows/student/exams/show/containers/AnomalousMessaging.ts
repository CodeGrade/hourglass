import { connect } from 'react-redux';
import { MDTP } from '@student/exams/show/types';
import AnomalousMessaging from '@student/exams/show/components/AnomalousMessaging';
import { loadMessages, loadQuestions } from '@student/exams/show/actions';
import { HitApiError } from '@hourglass/common/types/api';

interface OwnProps {
  examId: number;
  onError: (error: HitApiError) => void;
  onSuccess: () => void;
  disabled: boolean;
}

const mapDispatchToProps: MDTP<{
  refreshMessages: () => void;
  loadQuestions: () => void;
}, OwnProps> = (dispatch, ownProps) => ({
  refreshMessages: () => {
    const { onError, onSuccess } = ownProps;
    dispatch(loadMessages(ownProps.examId, onSuccess, onError));
  },
  loadQuestions: () => {
    const { onError, onSuccess } = ownProps;
    dispatch(loadQuestions(ownProps.examId, onSuccess, onError));
  },
});

export default connect(null, mapDispatchToProps)(AnomalousMessaging);
