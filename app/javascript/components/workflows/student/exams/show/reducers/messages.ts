import {
  MessagesState,
  ExamTakerAction,
} from '@student/exams/show/types';
import { DateTime } from 'luxon';

export default (state: MessagesState = {
  lastView: DateTime.fromSeconds(0),
  messages: {
    personal: [],
    room: [],
    version: [],
    exam: [],
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
        messages,
      };
    }
    case 'LOAD_EXAM':
      return {
        ...state,
        messages: action.messages,
      };
    case 'MESSAGES_OPENED':
      return {
        ...state,
        messages: state.messages,
        lastView: DateTime.local(),
      };
    default:
      return state;
  }
};
