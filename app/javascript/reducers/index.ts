import { ExamState } from '../types';
import { Action } from '../actions';

export function mainReducer(state: ExamState, action: Action): ExamState {
  switch (action.type) {
    case "UPDATE_ANSWER":
      const ret = { ...state };
      let cur = ret;
      for (let i = 0; i < action.path.length - 1; i++) {
        cur[action.path[i]] = { ...cur[action.path[i]] };
        cur = cur[action.path[i]];
      }
      cur[action.path[action.path.length - 1]] = action.val;
      return ret;
    default:
      console.log("Got a different action type: " + action.type);
      return state;
  }
}
