import {
  MessagesState,
  ExamTakerAction,
} from '@student/exams/show/types';

export default (state: MessagesState = {
  unread: false,
  messages: {
    personal: [],
    room: [],
    version: [],
  },
}, action: ExamTakerAction): MessagesState => {
  switch (action.type) {
    case 'MESSAGE_RECEIVED': {
      const messages = { ...state.messages };
      messages[action.msg.type] = [
        ...messages[action.msg.type],
        action.msg,
      ];
      return {
        ...state,
        unread: true,
        messages,
      };
    }
    case 'LOAD_EXAM':
      return {
        messages: action.messages,
        unread: (
          action.messages.personal.length !== 0
          || action.messages.room.length !== 0
          || action.messages.version.length !== 0
        ),
      };
    case 'MESSAGES_OPENED':
      return {
        ...state,
        messages: state.messages,
        unread: false,
      };
    default:
      return state;
  }
};
