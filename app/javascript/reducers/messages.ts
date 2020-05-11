import {
  MessagesState,
  ExamTakerAction,
} from '@hourglass/types';

export default (state: MessagesState = {
  unread: false,
  messages: [],
}, action: ExamTakerAction): MessagesState => {
  switch (action.type) {
    case 'MESSAGE_RECEIVED':
      return {
        ...state,
        unread: true,
        messages: [
          action.msg,
          ...state.messages,
        ],
      };
    case 'LOAD_EXAM':
      return {
        messages: action.messages,
        unread: action.messages.length !== 0,
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
