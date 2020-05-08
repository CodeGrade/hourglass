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
    default:
      return state;
  }
};
