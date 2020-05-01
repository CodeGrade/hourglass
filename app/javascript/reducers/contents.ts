import { AnswersState } from '@hourglass/types';
import {
  ContentsState,
  ExamTakerAction,
} from '@hourglass/types';

export default (state: ContentsState, action: ExamTakerAction): ContentsState => {
  switch (action.type) {
    case 'UPDATE_ANSWER':
      const ret = {
        ...state.answers,
      };
      let cur = ret;
      for (let i = 0; i < action.path.length - 1; i++) {
        cur[action.path[i]] = { ...cur[action.path[i]] };
        cur = cur[action.path[i]];
      }
      cur[action.path[action.path.length - 1]] = action.val;
      return {
        ...state,
        answers: ret,
      };
    default:
      return state;
  }
}
