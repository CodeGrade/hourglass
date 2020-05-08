import {
  MessagesState,
  ExamTakerAction,
} from '@hourglass/types';

export default (state: MessagesState = [], action: ExamTakerAction): MessagesState => {
  switch (action.type) {
    case 'MESSAGE_RECEIVED':
      return [
        action.msg,
        ...state,
      ];
    case 'LOAD_EXAM':
      return action.messages;
    default:
      return state;
  }
};
