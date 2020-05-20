import { connect } from 'react-redux';
import { MSTP, MDTP, ExamMessage } from '@student/types';
import ExamMessages from '@student/components/navbar/ExamMessages';
import { messagesOpened } from '@student/actions';

const mapStateToProps: MSTP<{
  messages: ExamMessage[];
  unread: boolean;
}> = (state) => ({
  messages: state.messages.messages,
  unread: state.messages.unread,
});

const mapDispatchToProps: MDTP<{
  onMessagesOpened: () => void;
}> = (dispatch) => ({
  onMessagesOpened: (): void => {
    dispatch(messagesOpened());
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(ExamMessages);
