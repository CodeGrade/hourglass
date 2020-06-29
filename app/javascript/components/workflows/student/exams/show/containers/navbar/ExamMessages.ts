import { connect } from 'react-redux';
import { MSTP, MDTP, AllExamMessages } from '@student/exams/show/types';
import ExamMessages, { ShowExamMessages } from '@student/exams/show/components/navbar/ExamMessages';
import { messagesOpened } from '@student/exams/show/actions';
import { DateTime } from 'luxon';

const mapStateToProps: MSTP<{
  messages: AllExamMessages;
  lastViewed: DateTime;
}> = (state) => ({
  messages: state.messages.messages,
  lastViewed: state.messages.lastView,
});

const mapDispatchToProps: MDTP<{
  onMessagesOpened: () => void;
}> = (dispatch) => ({
  onMessagesOpened: (): void => {
    dispatch(messagesOpened());
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(ExamMessages);

export const ExamMessagesStandalone = connect(
  mapStateToProps,
  mapDispatchToProps,
)(ShowExamMessages);
