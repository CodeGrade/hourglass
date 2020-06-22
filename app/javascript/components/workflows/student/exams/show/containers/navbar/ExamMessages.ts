import { createSelector } from 'reselect';
import { connect } from 'react-redux';
import { MSTP, MDTP, ExamMessage } from '@student/exams/show/types';
import ExamMessages, { ExamMessagesProps } from '@student/exams/show/components/navbar/ExamMessages';
import { messagesOpened } from '@student/exams/show/actions';

const getPersonalMessages = (state) => state.messages.messages.personal;
const getRoomMessages = (state) => state.messages.messages.room;
const getVersionMessages = (state) => state.messages.messages.version;

const getAllMessages = createSelector(
  [getPersonalMessages, getRoomMessages, getVersionMessages],
  (personal, room, version) => ([
    ...personal,
    ...room,
    ...version,
  ].sort((msgA, msgB) => msgB.time.diff(msgA.time, 'seconds').seconds)),
);

const mapStateToProps: MSTP<{
  messages: ExamMessage[];
  unread: boolean;
}, ExamMessagesProps> = (state, ourProps) => {
  const newMessages = getAllMessages(state);
  if (newMessages === ourProps.messages && state.messages.unread === ourProps.unread) {
    return ourProps;
  }
  return {
    messages: newMessages,
    unread: state.messages.unread,
  };
};

const mapDispatchToProps: MDTP<{
  onMessagesOpened: () => void;
}, ExamMessagesProps> = (dispatch) => ({
  onMessagesOpened: (): void => {
    dispatch(messagesOpened());
  },
});

const ExamMessagesConnected = connect(mapStateToProps, mapDispatchToProps)(ExamMessages);
ExamMessagesConnected.displayName = 'ExamMessagesConnected';
export default ExamMessagesConnected;
ExamMessages.whyDidYouRender = true;
